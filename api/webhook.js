const express = require('express');
const app = express();

// Course information
const courses = {
    'HS1026': 'Engineering Ethics and Precepts of Constitution of India',
    'CS1119': 'Machine Learning',
    'CS1120': 'Cyber Security',
    'CS1601': 'Artificial Intelligence',
    'CS1602': 'Bigdata Analytics',
    'CS1058': 'Computer Graphics',
    'CS1501': 'Python Programming',
    'IP1302': 'Project II'
};

// Schedule
const schedule = {
    'Monday': {
        '8.30-9.20': 'CS1602',
        '9.25-10.15': 'CS1501',
        '1.30-2.20': 'CS1058',
        '2.25-3.15': 'CS1119',
        '3.20-4.10': 'CS1601'
    },
    'Tuesday': {
        '8.30-9.20': 'CS1601',
        '9.25-10.15': 'CS1119',
        '10.20-11.10': 'CS1501',
        '12.10-1.00': 'CS1120'
    },
    'Wednesday': {
        '2.25-3.15': 'CS1120',
        '3.20-4.10': 'CS1119',
        '4.15-5.05': 'HS1026'
    },
    'Thursday': {
        '8.30-9.20': 'HS1026',
        '1.30-2.20': 'CS1120',
        '2.25-3.15': 'CS1058',
        '3.20-4.10': 'CS1602'
    },
    'Friday': {
        '8.30-9.20': 'CS1058',
        '9.25-10.15': 'HS1026',
        '10.20-11.10': 'CS1602',
        '11.15-12.05': 'CS1501',
        '12.10-1.00': 'CS1601'
    }
};

// Helper functions
const timeSlots = [
    '8.30-9.20', '9.25-10.15', '10.20-11.10', '11.15-12.05', 
    '12.10-1.00', '1.30-2.20', '2.25-3.15', '3.20-4.10', '4.15-5.05'
];

function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function timeSlotToMinutes(timeSlot) {
    const [start] = timeSlot.split('-');
    const [hours, minutes] = start.split('.').map(Number);
    return hours * 60 + minutes;
}

function getDayName(date = new Date()) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function getCurrentClass() {
    const today = getDayName();
    const currentTime = getCurrentTimeInMinutes();
    
    if (!schedule[today]) {
        return "No classes today!";
    }
    
    const todaySchedule = schedule[today];
    
    for (const timeSlot of timeSlots) {
        if (todaySchedule[timeSlot]) {
            const slotStart = timeSlotToMinutes(timeSlot);
            const slotEnd = timeSlotToMinutes(timeSlot.split('-')[1]);
            
            if (currentTime >= slotStart && currentTime <= slotEnd) {
                const courseCode = todaySchedule[timeSlot];
                return `📚 *Current Class:*\n${timeSlot}: ${courses[courseCode] || courseCode}`;
            }
        }
    }
    
    return "No class is currently running.";
}

function getNextClass() {
    const today = getDayName();
    const currentTime = getCurrentTimeInMinutes();
    
    if (!schedule[today]) {
        return "No more classes today!";
    }
    
    const todaySchedule = schedule[today];
    
    for (const timeSlot of timeSlots) {
        if (todaySchedule[timeSlot]) {
            const slotStart = timeSlotToMinutes(timeSlot);
            
            if (currentTime < slotStart) {
                const courseCode = todaySchedule[timeSlot];
                return `⏰ *Next Class:*\n${timeSlot}: ${courses[courseCode] || courseCode}`;
            }
        }
    }
    
    return "No more classes today!";
}

function getTodaySchedule() {
    const today = getDayName();
    
    if (!schedule[today]) {
        return `No classes scheduled for ${today}!`;
    }
    
    let scheduleText = `📅 *${today}'s Schedule:*\n\n`;
    const todaySchedule = schedule[today];
    
    for (const timeSlot of timeSlots) {
        if (todaySchedule[timeSlot]) {
            const courseCode = todaySchedule[timeSlot];
            scheduleText += `${timeSlot}: ${courses[courseCode] || courseCode}\n`;
        }
    }
    
    return scheduleText;
}

// Webhook handler
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { message, from } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    const userMessage = message.toLowerCase().trim();
    let response = '';
    
    if (userMessage === 'hi' || userMessage === 'hello') {
        const currentClass = getCurrentClass();
        const nextClass = getNextClass();
        const todaySchedule = getTodaySchedule();
        
        response = `👋 *Hello!*\n\n${currentClass}\n\n${nextClass}\n\n${todaySchedule}`;
    }
    else if (userMessage === 'current') {
        response = getCurrentClass();
    }
    else if (userMessage === 'next') {
        response = getNextClass();
    }
    else if (userMessage === 'today') {
        response = getTodaySchedule();
    }
    else if (userMessage === 'help') {
        response = `🤖 *Available Commands:*\n\n` +
                  `• *hi* - Get current, next class & today's schedule\n` +
                  `• *current* - Get current running class\n` +
                  `• *next* - Get next upcoming class\n` +
                  `• *today* - Get today's full schedule\n` +
                  `• *help* - Show this help message`;
    }
    else {
        response = "Send 'hi' to get your schedule or 'help' for commands.";
    }
    
    res.status(200).json({ 
        success: true, 
        response: response,
        timestamp: new Date().toISOString()
    });
}
