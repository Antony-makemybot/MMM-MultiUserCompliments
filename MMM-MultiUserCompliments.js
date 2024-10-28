Module.register("MMM-MultiUserCompliments", {
    defaults: {
        updateInterval: 30000,
        compliments: {
            "Akshay": {
                anytime: ["Hey there Handsome!", "You're amazing, Akshay!"],
                morning: ["Good morning, Akshay!", "Enjoy your day, Akshay!"],
                afternoon: ["You're a star, Akshay!", "You're looking great, Akshay!"],
                evening: ["Fantastic job today, Akshay!", "Enjoy your evening, Akshay!"]
            },
            "Sona": {
                anytime: ["Hey there, gorgeous!", "You're amazing, Sona!"],
                morning: ["Good morning, Sona!", "Enjoy your day, Sona!"],
                afternoon: ["You're looking great, Sona!", "Keep up the great work, Sona!"],
                evening: ["Enjoy your evening, Sona!", "Wow, you look fantastic!"]
            },
            "Antony": {
                anytime: ["Hey there Antony!"],
                morning: ["Good morning, Antony!", "Enjoy your day, Antony!"],
                afternoon: ["Hello, Antony!", "You're looking great, Antony!"],
                evening: ["Wow, you look fantastic, Antony!", "Enjoy your evening!"]
            }
        }
    },

    start: function() {
        this.complimentText = "";
        this.userList = [];
        this.sendSocketNotification("REGISTER_MODULE", this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FACE_RECOGNIZED") {
            this.userList = payload.users; // Assuming payload contains an array of recognized users
            this.updateCompliments();
        }
    },

    updateCompliments: function() {
        let complimentsToShow = [];
        const currentTime = this.getCurrentTimeOfDay();
        
        this.userList.forEach(user => {
            const userCompliments = this.config.compliments[user] || {};
            if (userCompliments[currentTime]) {
                complimentsToShow.push(...userCompliments[currentTime]);
            }
        });

        if (complimentsToShow.length > 0) {
            this.complimentText = complimentsToShow.join('<br/>');
            this.updateDom();
        }
    },

    getCurrentTimeOfDay: function() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        else if (hour < 18) return 'afternoon';
        else return 'evening';
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = this.complimentText;
        return wrapper;
    }
});
