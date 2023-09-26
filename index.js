import express from 'express';
import { create, engine } from 'express-handlebars';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// Initialise sqlite db
const dbPromise = open({
  filename: 'data.db',
  driver: sqlite3.Database
});

// Initialise express
const app = express();

const hbs = create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        ifEquals(arg1, arg2, options){
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        }
    }
})

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.urlencoded({extended: false}))

app.get('/', async (req, res) => {
    const db = await dbPromise
    const messages = await db.all('SELECT * FROM Message ORDER BY activeafter;');
    const todayMessages = await db.all('SELECT * FROM Message WHERE duedate<="2023-09-26" ORDER BY duedate');
    const laterMessages = await db.all('SELECT * FROM Message WHERE duedate>"2023-09-26" ORDER BY duedate');
    res.render('home', {
        todayMessages,
        messages,
        laterMessages
    });
});

// Create new task
app.post('/message', async (req, res) => {
    const db = await dbPromise
    const messageTitle = req.body.title 
    const messageDescription = req.body.description
    const initStatus = "uncompleted"
    const daily = req.body.daily
    const thisyear = new Date().getFullYear()
    const thismonth = new Date().getMonth()
    const thismonth2digits = thismonth.toString().length===1 ? '0'+thismonth : thismonth
    const thisday = new Date().getDate()
    const thisday2digits = thisday.toString().length===1 ? '0'+thisday : thisday
    const today = thisyear+'-'+thismonth2digits+'-'+thisday2digits
    const duedate = (req.body.duedate !== "" ? req.body.duedate : today)
    const activeafter = req.body.activeafter
    await db.run('INSERT INTO Message (title, description, status, daily, duedate, activeafter) VALUES (?,?,?,?,?,?);', messageTitle, messageDescription, initStatus, daily, duedate, activeafter)
    res.redirect('/')
});

// Update task
app.post('/updatetask', async (req, res) => {
    const db = await dbPromise
    const messageTitle = req.body.title 
    const messageDescription = req.body.description
    const initStatus = "uncompleted"
    const daily = req.body.daily
    const thisyear = new Date().getFullYear()
    const thismonth = new Date().getMonth()
    const thismonth2digits = thismonth.toString().length===1 ? '0'+thismonth : thismonth
    const thisday = new Date().getDate()
    const thisday2digits = thisday.toString().length===1 ? '0'+thisday : thisday
    const today = thisyear+'-'+thismonth2digits+'-'+thisday2digits
    const duedate = (req.body.duedate !== "" ? req.body.duedate : today)
    const activeafter = req.body.activeafter
    const messageID = req.body.id;
    await db.run('UPDATE Message SET (title, description, status, daily, duedate, activeafter) = (?,?,?,?,?,?) WHERE id = (?);', messageTitle, messageDescription, initStatus, daily, duedate, activeafter, messageID)
    res.redirect('/')
});

// Update task from dialogue pane
app.post('/updatedialog', async (req, res) => {
    const db = await dbPromise
    const messageDescription = req.body.description
    const messageID = req.body.id.replace('dialogDescriptionInput', '')
    await db.run('UPDATE Message SET (description) = (?) WHERE id = (?);', messageDescription, messageID)
    res.redirect('/')
});


// Mark task completed
app.post('/completed', async (req, res) => {
    const db = await dbPromise
    const messageID = req.body.id;
    await db.run('UPDATE Message SET status = "completed" WHERE id = (?);', messageID)
    res.redirect('/')
});


// Setup CSS
app.use(express.static('public'))

// Setup (final step in Express)
const setup = async () => {
    const db = await dbPromise
    await db.migrate()
    app.listen(8000, () => {
        console.log ('listening on port 8000');
    });
}
setup();

