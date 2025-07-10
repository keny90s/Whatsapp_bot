// Simple API to get schedule info
export default function handler(req, res) {
    const { action } = req.query;
    
    // Same helper functions as above...
    // (Copy the helper functions from webhook.js)
    
    let result = '';
    
    switch(action) {
        case 'current':
            result = getCurrentClass();
            break;
        case 'next':
            result = getNextClass();
            break;
        case 'today':
            result = getTodaySchedule();
            break;
        default:
            result = 'Invalid action. Use: current, next, or today';
    }
    
    res.status(200).json({ data: result });
}
