# DroneCI Notify

A simple utility to watch progress of build and notify when the build finishes. Either with failure or succesfully.

You can watch multiple builds, when one or more fails, you'll know immediately. Otherwise you'll know when all finished successfully.

## Prerequisites

Clone the repo and install deps:
```
git clone https://github.com/synaptiko/droneci-notify.git
cd droneci-notify
yarn install
```

Create `.env` file with DroneCI server URL and token:
```
DRONE_SERVER=https://ci.your-instance.com
DRONE_TOKEN=YourToken
```

Note: you can get the above by visiting https://ci.your-instance.com/account

For notifications to work you need to follow the instructions in https://github.com/tj/node-growl#installation

## Usage

You can wait for one or more builds to finish just by passing URL of build in the command-line:
```
yarn wait-for https://ci.your-instance.com/owner/repo/666 https://ci.your-instance.com/owner/repo/777
```

## Any ideas to improve it?

Contribute by creating a PR ;-)
