const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

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

// Your schedule
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

// WhatsApp client events
client.on('qr', (qr) => {
    console.log('Scan this QR code to login:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
    const userMessage = message.body.toLowerCase().trim();
    
    if (userMessage === 'hi' || userMessage === 'hello') {
        const currentClass = getCurrentClass();
        const nextClass = getNextClass();
        const todaySchedule = getTodaySchedule();
        
        const response = `👋 *Hello!*\n\n${currentClass}\n\n${nextClass}\n\n${todaySchedule}`;
        await message.reply(response);
    }
    else if (userMessage === 'current') {
        await message.reply(getCurrentClass());
    }
    else if (userMessage === 'next') {
        await message.reply(getNextClass());
    }
    else if (userMessage === 'today') {
        await message.reply(getTodaySchedule());
    }
    else if (userMessage === 'help') {
        const helpText = `🤖 *Available Commands:*\n\n` +
                        `• *hi* - Get current, next class & today's schedule\n` +
                        `• *current* - Get current running class\n` +
                        `• *next* - Get next upcoming class\n` +
                        `• *today* - Get today's full schedule\n` +
                        `• *help* - Show this help message`;
        await message.reply(helpText);
    }
});

// Initialize
client.initialize();

// Express server
app.get('/', (req, res) => {
    res.json({ status: 'WhatsApp bot is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});