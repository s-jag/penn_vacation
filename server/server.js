const express = require('express');
const cors = require('cors');
const config = require('./config.js');
const routes = require('./routes');


const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

const app = express();
app.use(cors(corsOptions));

app.use(express.json());


// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/user_preferences/:user_id', routes.get_user_preferences);
app.put('/user_preferences/:user_id', routes.patch_user_preferences);
app.get('/album_songs/:album_id', routes.album_songs);
app.get('/search_songs', routes.search_songs);
app.get('/random', routes.random);
app.post('/find_itinerary', routes.find_itinerary);
app.post('/find_featured_itinerary', routes.find_featured_itinerary);
app.post('/find_group_itinerary', routes.find_group_itinerary);
app.get('/cart', routes.get_cart);
app.post('/cart', routes.add_to_cart);
app.delete('/cart/:entry_id', routes.delete_from_cart);

app.listen(config.server_port, () => {
  console.log(`Server running at ${config.server_host}:${config.server_port}/`)
});

module.exports = app;
