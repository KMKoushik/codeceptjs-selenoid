const { container, event, recorder, output } = require('codeceptjs');
const { execSync } = require('child_process');


const dockerStartScript = 'docker start selenoid';
const dockerStopScript = 'docker stop selenoid';

const startSelenoid = () => {
  output.print('Starting selenoid');
  execSync(dockerStartScript);
};

const stopSelenoid = () => {
  output.print('Stopping selenoid');
  execSync(dockerStopScript);
};

const setSelenoidOptions = (config) => {
  const WebDriver = container.helpers('WebDriver');
  WebDriver._setConfig(Object.assign(WebDriver.options, {
    capabilities: { 'selenoid:options': config },
  }));
};

const selenoid = (config) => {
  const { autoStart } = config;
  if (autoStart) {
    startSelenoid();

    event.dispatcher.on(event.all.after, () => {
      recorder.add('setting selenoid capabilities', () => {
        setTimeout(() => stopSelenoid(), 10000); // For selenoid to change the video file name
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
      WebDriver._setConfig(options);
    });
  });
};

module.exports = selenoid;
