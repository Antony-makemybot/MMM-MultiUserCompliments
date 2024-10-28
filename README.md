# MMM-Multiple-User-Compliments

A Magic Mirror module that provides personalized compliments for multiple recognized users. This module works in conjunction with the MMM-Face-Reco-DNN module for face recognition.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Displays customized compliments for each recognized user.
- Supports multiple users simultaneously.
- Compliments can be configured for different users or groups.
- Seamless integration with face recognition modules.

## Requirements

- **Magic Mirror**: You need to have the Magic Mirror framework set up. [Follow the official setup guide](https://docs.magicmirror.builders/getting-started/installation.html).
- **MMM-Face-Reco-DNN**: This module requires the MMM-Face-Reco-DNN for user recognition.

## Installation

1. Navigate to your Magic Mirror `modules` directory:

   ```bash
   cd ~/MagicMirror/modules
   ```
   Create a directory for your new module:
   ```bash
   mkdir MMM-MultiUserCompliments
   cd MMM-MultiUserCompliments
   ```
    or
    clone this repo to your module
   ```bash
   https://github.com/Antony-makemybot/MMM-MultiUserCompliments.git
   ```
2. Update Your config.js
   Add the new module to your config.js:
   ```bash
   {
    module: "MMM-MultiUserCompliments",
    position: "lower_third",  // Adjust the position as needed
    config: {}  // Add any specific configurations if necessary
   }
   ```
3. Modify MMM-Face-Reco-DNN
   ```js
   * Magic Mirror
    * Module: MMM-Face-Reco-DNN
    *
    * By Thierry Nischelwitzer http://nischi.ch
    * MIT Licensed.
    */

   /*global log*/

   'use strict';

   // eslint-disable-next-line no-undef
   Module.register('MMM-Face-Reco-DNN', {
     defaults: {
    // Configuration options
    // ...
     },

     timouts: {},
     users: [],
     userClasses: [],
     image: '',

     // ----------------------------------------------------------------------------------------------------
     start: function () {
    // Initialize the module
    this.sendSocketNotification('CONFIG', this.config);
    Log.log('Starting module: ' + this.name);
    this.config.debug && Log.log(this.config);

    // Define user classes for different states
    this.config.classes_noface = [this.config.noFaceClass, this.config.defaultClass, this.config.alwaysClass];
    this.config.classes_unknown = [this.config.unknownClass, this.config.defaultClass, this.config.everyoneClass, this.config.alwaysClass];
    this.config.classes_known = [this.config.knownClass, this.config.everyoneClass, this.config.alwaysClass];
     },

     // ----------------------------------------------------------------------------------------------------
     socketNotificationReceived: function (notification, payload) {
    var self = this;
    var user;

    if (notification === 'camera_image') {
      // Update image from the camera
      this.image = payload.image;
      this.updateDom(this.config.animationSpeed);
    }

    // Check if users are logging in
    if (payload.action === 'login') {
      var loginCount = 0;
      for (user of payload.users) {
        if (user != null) {
          this.config.debug && Log.log('Number of logged in users: ' + this.users.length + ', Allowed Number of Users: ' + this.config.multiUser);
          if (this.users.length === 0 || this.users.length < this.config.multiUser) {
            // Only log in if the user is not already logged in
            if (!this.users.includes(user)) {
              this.login_user(user); // Handle user login
              loginCount++;
            } else {
              this.config.debug && Log.log('Detected ' + user + ' again.');
            }
          } else {
            this.config.debug &&
              Log.log(
                'Detected a login event for ' + user + ' but multiple concurrent logins is limited to ' + this.config.multiUser + ' and ' + this.users + ' is already logged in.'
              );
          }

          // Clear any logout timeouts for this user
          if (this.timouts[user] != null) {
            this.config.debug && Log.log('Clearing timeouts for ' + user);
            clearTimeout(this.timouts[user]);
          }
        }
      }

      // If new logins were detected, send the user array to the compliments module
      if (loginCount > 0) {
        this.sendNotification('USERS_LOGIN', this.users); // Send recognized users array
        this.config.debug && Log.log('Detected ' + loginCount + ' logins.');
      }
    } 
    // Check if users are logging out
    else if (payload.action === 'logout') {
      var logoutCount = 0;
      for (user of payload.users) {
        if (user != null) {
          if (this.users.includes(user)) {
            this.config.debug && Log.log('Setting logout timer for ' + user + ' for ' + this.config.logoutDelay + 'ms');
            this.timouts[user] = setTimeout(function () {
              self.sendNotification('USERS_LOGOUT_MODULES', user); // Notify that user is logging out
              self.logout_user(user); // Handle user logout
              logoutCount++;
            }, this.config.logoutDelay);
          } else {
            this.config.debug && Log.log('Detected a logout event for ' + user + ' but they were not logged in.');
          }
        }
      }

      // If logouts were detected, send notification
      if (logoutCount > 0) {
        this.config.debug && Log.log('Detected ' + logoutCount + ' logouts.');
        this.sendNotification('USERS_LOGOUT', payload.users);
      }
    }
     },

     // ----------------------------------------------------------------------------------------------------
     notificationReceived: function (notification, payload, _sender) {
    if (notification === 'DOM_OBJECTS_CREATED') {
      // Hide modules that should not be shown at startup
      this.hide_modules(0, this.config.classes_noface);
    }

    // Load the currently logged-in users
    if (notification === 'GET_LOGGED_IN_USERS') {
      Log.log(this.name + ' get logged in users ' + this.users);
      this.sendNotification('LOGGED_IN_USERS', this.users); // Send the current user list
    }
     },

     // ----------------------------------------------------------------------------------------------------
     getDom: function () {
    // Create and return the DOM for this module
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('face-recognition');

    const imageEl = document.createElement('img');
    imageEl.classList.add('face-recognition-image');
    imageEl.src = 'data:image/jpg;base64,' + this.image; // Set the source to the captured image
    wrapperEl.appendChild(imageEl);

    return wrapperEl;
     },
   });

   ```
   or
   Modify the code inside the socketNotificationReceived function as follows:

   * Send the recognized users array to the compliments module.
   * Ensure that the new compliments module can handle this notification.
```js
   // Inside the socketNotificationReceived function
if (notification === 'camera_image') {
    // existing code
} else if (payload.action === 'login') {
    var loginCount = 0;
    for (user of payload.users) {
        if (user != null) {
            // existing login logic
            if (!this.users.includes(user)) {
                this.login_user(user);
                loginCount++;
            }
        }
    }

    if (loginCount > 0) {
        // Send the full array of logged in users to the compliments module
        this.sendNotification('USERS_LOGIN', this.users); // Send the updated users array
    }
} else if (payload.action === 'logout') {
    // existing logout logic
}
```
In your MMM-MultiUserCompliments module, make sure to handle the USERS_LOGIN notification to display compliments for all recognized users. You might do something like this
```js
notificationReceived: function (notification, payload) {
    if (notification === 'USERS_LOGIN') {
        // payload is the array of recognized users
        this.updateCompliments(payload); // Update compliments based on logged-in users
    }
}
```

5. Restart MagicMirror


