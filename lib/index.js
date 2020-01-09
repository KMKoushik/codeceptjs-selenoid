const { container, event, recorder, output } = require('codeceptjs');
const util = require('util');
const axios = require('axios').default;
const exec = util.promisify(require('child_process').exec);

let dockerCreateScript = `docker create --rm --name $name$ -p 4444:4444 -v /var/run/docker.sock:/var/run/docker.sock -v ${global.codecept_dir}/:/etc/selenoid/:ro -v ${global.output_dir}/video/:/opt/selenoid/video/ -v ${global.output_dir}/logs/:/opt/selenoid/logs/ -e OVERRIDE_VIDEO_OUTPUT_DIR=${global.output_dir}/video/ $additionalParams$ aerokube/selenoid:latest-release -log-output-dir /opt/selenoid/logs`;
let dockerStartScript = 'docker start $name$';
let dockerStopScript = 'docker stop $name$';
const seleniumUrl = 'http://localhost:4444';

const createSelenoid = () => exec(dockerCreateScript);

const startSelenoid = () => exec(dockerStartScript);

const stopSelenoid = () => exec(dockerStopScript);

const wait = (time) => new Promise((res) => setTimeout(() => res(), time));

const createAndStart = (autoCreate) => {
  const selenoidCreated = autoCreate ? createSelenoid() : Promise.resolve();
  return selenoidCreated.then(startSelenoid).then(() => wait(2000));
};

const deletePassedTests = (passedTests) => {
  const deleteVideoPromiseList = passedTests.map((test) => axios.delete(`${seleniumUrl}/video/${test}.mp4`));
  const deleteLogPromiseList = passedTests.map((test) => axios.delete(`${seleniumUrl}/logs/${test}.log`));

  return Promise.all(deleteVideoPromiseList.concat(deleteLogPromiseList)).then(output.debug('Deleted passed tests'));
};

const setSelenoidOptions = (config) => {
  const WebDriver = container.helpers('WebDriver');
  WebDriver._setConfig(Object.assign(WebDriver.options, {
    capabilities: { 'selenoid:options': config },
  }));
};

const replaceScriptConfig = (config) => {
  for (const key of Object.keys(config)) {
    dockerCreateScript = dockerCreateScript.replace(`$${key}$`, config[key]);
  }
  dockerStartScript = dockerStartScript.replace('$name$', config.name);
  dockerStopScript = dockerStopScript.replace('$name$', config.name);
};


const selenoid = (config) => {
  const { autoStart, name = 'selenoid', deletePassed = true, additionalParams = '', autoCreate = true } = config;
  const passedTests = [];
  recorder.startUnlessRunning();
  replaceScriptConfig({ name, additionalParams });

  if (autoStart) {
    event.dispatcher.on(event.all.before, () => {
      recorder.add('Starting selenoid', async () => {
        return createAndStart(autoCreate).then(() => output.debug('Selenoid started')).catch((err) => { throw err; });
      });
    });

    event.dispatcher.on(event.all.after, () => {
      recorder.add('Stopping selenoid', async () => {
        return wait(10000).then(() => deletePassedTests(passedTests)).then(stopSelenoid).then(() => output.debug('Selenoid stopped'))
          .catch((err) => { throw err; });
      });
    });
  }

  event.dispatcher.on(event.all.before, () => {
    setSelenoidOptions(config);
  });

  event.dispatcher.on(event.test.before, (test) => {
    const WebDriver = container.helpers('WebDriver');
    const { options } = WebDriver;
    recorder.add('setting selenoid capabilities', () => {
      options.capabilities['selenoid:options'].name = test.title;
      options.capabilities['selenoid:options'].videoName = `${test.title}.mp4`;
      options.capabilities['selenoid:options'].logName = `${test.title}.log`;
      WebDriver._setConfig(options);
    });
  });

  if (deletePassed) {
    event.dispatcher.on(event.test.passed, (test) => {
      passedTests.push(test.title);
    });
  }
};

module.exports = selenoid;
