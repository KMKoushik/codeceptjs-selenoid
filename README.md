# codeceptjs-selenoid

Selenoid plugin with video recording capabilities for CodeceptJS

## Prerequisite

 - Docker

## How to ?

### 1. Add browsers.json
Add browsers.json parallel to codecept conf location. [Refer here](https://aerokube.com/selenoid/latest/#_prepare_configuration) to know more about browsers.json

**You can download the sample json from example.**

### 2. Add plugin configuration in codecept

 Add plugin config to codecept conf. 
```js
plugins: {
    selenoid: {
      require: '../lib/index',
      enabled: true,
      name: 'testnoid',
      deletePassed: true,
      autoCreate: true,
      autoStart: true,
      sessionTimeout: '30m',
      enableVideo: true,
      enableLog: true,
      additionalParams: '--env TEST=test',
    },
  }
```
#### Options:
| Param | Description |
|--|--|
| name | Name of the container |
| deletePassed | Delete video and logs of passed tests |
| autoCreate | Will automatically create container (Linux only)|
| autoStart | If disabled start the container manually before running tests |
| enableVideo | Enable video recording (`video` folder of output)|
| enableLog | Enable video recording (`logs` folder of output) |
| additionalParams | [Refer here](https://docs.docker.com/engine/reference/commandline/create/) to know more |



### 3. Create selenoid container
**If you are using linux machine, we can handle this for you.**

Run the following command to create one. To know more [refer here](https://aerokube.com/selenoid/latest/#_option_2_start_selenoid_container)
```
docker create                                    \
--name selenoid                                  \
-p 4444:4444                                     \
-v /var/run/docker.sock:/var/run/docker.sock     \
-v `pwd`/:/etc/selenoid/:ro                      \
-v `pwd`/output/video/:/opt/selenoid/video/      \
-e OVERRIDE_VIDEO_OUTPUT_DIR=`pwd`/output/video/ \
aerokube/selenoid:latest-release
```


## Sample

![Sample ](example/sample_selenoid.gif)