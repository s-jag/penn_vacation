const mysql = require('mysql')
const config = require('./config.js')

// Creates MySQL connection using database credential provided in config.js
// Do not edit. If the connection fails, make sure to check that config.js is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const executeDatabaseQuery = (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};



// GET /user_preferences/:user_id
// Get user_preferences given user_id
const get_user_preferences = async function (req, res) {
  const user_id = req.params.user_id;
  const query = `SELECT * FROM user_preferences WHERE user_id = "${user_id}";`
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    } else {
      res.status(200).json(data)
    }
  })
}

// Patch user_preferences given user_id
const patch_user_preferences = async function (req, res) {
  const user_id = req.params.user_id;
  console.log(req.body)
  const values = {
    user_id: user_id,
    budget: req.body.budget,
    temp_min: req.body.temp_min,
    temp_max: req.body.temp_max,
    leave_date: req.body.leave_date,
    return_date: req.body.return_date,
    city: req.body.city,
    state: req.body.state,
  };

  const vValues = {};
  Object.keys(values).forEach((key) => {
    if (values[key] !== undefined) vValues[key] = values[key];
  });

  const keys = Object.keys(vValues);
  const keyString = keys.join(', ');

  const valuesArray = Object.values(vValues).map((value) => {
    if (typeof value === 'string') return `"${value}"`;
    return value;
  });
  const valuesString = valuesArray.join(', ');

  const updateArray = keys.map((key, i) => {
    return `${key} = ${valuesArray[i]}`;
  })
  const updateString = updateArray.join(', ');
  // Start constructing the query
  let query = `INSERT INTO user_preferences (${keyString}) VALUES (${valuesString}) ON DUPLICATE KEY UPDATE ${updateString};`;

  console.log(query)
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    } else {
      res.status(200).send('OK')
    }
  })
}

// FOR REFERENCE
const album_songs = async function (req, res) {
  connection.query(`SELECT x FROM y WHERE a="${req.params.b}"`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

const search_songs = async function (req, res) {

  const t = req.query.title;
  const a = req.query.a;
  const b = req.query.b
  connection.query(`SELECT * FROM x WHERE title LIKE "%${t}%" AND d BETWEEN ${a} AND ${b} ORDER BY title ASC`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


const random = async function (req, res) {
  const q = `
  SELECT * FROM featured_trips
  ORDER BY RAND()
  LIMIT 1;
  `;
  try {
    const itinerary = await executeDatabaseQuery(q);
    console.log(itinerary);
    res.status(200).json(itinerary);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  };
}

const find_itinerary = async function (req, res) {
  const { temp_min, temp_max, budget, city, state, leave_date, return_date } = req.query;
  console.log('Inputs received:', { temp_min, temp_max, budget, city, state, leave_date, return_date });
  var leave = new Date(leave_date);
  var returnDate = new Date(return_date);
  // Validate inputs...
  var leaveMonth = leave.getMonth() + 1;
  var returnMonth = returnDate.getMonth() + 1;
  var leaveQuarter = 1;
  var returnQuarter = 1;

  if (leaveMonth <= 3) {
    leaveQuarter = 1;
  } else if (leaveMonth <= 6) {
    leaveQuarter = 2;
  } else if (leaveMonth <= 9) {
    leaveQuarter = 3;
  } else {
    leaveQuarter = 4;
  }

  if (returnMonth <= 3) {
    returnQuarter = 1;
  } else if (returnMonth <= 6) {
    returnQuarter = 2;
  } else if (returnMonth <= 9) {
    returnQuarter = 3;
  } else {
    returnQuarter = 4;
  }

  function getMonthAbbreviation(monthNumber) {
    // Array of month abbreviations
    var monthAbbreviations = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dece"
    ];

    // Check if the month number is valid (between 1 and 12)
    if (monthNumber >= 1 && monthNumber <= 12) {
      // Subtract 1 to get the correct index in the array
      return monthAbbreviations[monthNumber - 1];
    } else {
      // Handle invalid month numbers
      return "Invalid month number";
    }
  }

  var leaveMonthName = getMonthAbbreviation(leaveMonth);
  var returnMonthName = getMonthAbbreviation(returnMonth);

  var difference = returnDate - leave;
  var seconds = Math.floor(difference / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  // Updated SQL query
  // const itineraryQuery1 = `SELECT * FROM destinations LIMIT 5;`
  const itineraryQuery = `WITH origin AS (
    SELECT
        city,
        state,
        id
    FROM
        (
            SELECT d.city as city, d.state as state, d.longitude, d.latitude
            FROM destinations d
            WHERE d.city = '${city}' AND d.state = '${state}' -- parameterized city and state
        ) d
        JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
),
f1_ordered AS (
    SELECT *
    FROM flights f
    WHERE f.quarter = ${leaveQuarter} AND f.start IN (SELECT id FROM origin) -- parameterized leave quarter
    ORDER BY f.fare
),
result AS(
    SELECT DISTINCT
        o.city AS "Origin City",
        o.state AS "Origin State",
        f1.start AS "Departing Flight - From",
        f1.target AS "Departing Flight - To",
        t.${leaveMonthName} AS "Destination Temperature",
        ab.name AS "Airbnb Name",
        ab.city AS "Airbnb City",
        ab.state AS "Airbnb State",
        ab.night_price AS "Airbnb Nightly Price",
        f2.start AS "Returning Flight - From",
        f2.target AS "Returning Flight - To",
        f1.fare + ab.night_price * ${days} + f2.fare AS Cost -- parameterized number of nights
    FROM
        origin o
    JOIN f1_ordered f1 ON o.id = f1.start
    JOIN nearby_cities nc ON f1.target = nc.airport_id
    JOIN nearby_temps nt ON nc.dest_longitude = nt.dest_longitude AND nc.dest_latitude = nt.dest_latitude
    JOIN
        (
            SELECT *
            FROM temps
            WHERE ${leaveMonthName} < ${temp_max} AND ${leaveMonthName} > ${temp_min} -- parameterized temperature range
        ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
    JOIN cheapest_airbnb ab ON f1.target = ab.airport_id
    JOIN nearby_airports nap2 ON nc.dest_latitude = nap2.dest_lat AND nc.dest_longitude = nap2.dest_long
    JOIN airports ap2 ON nap2.id = ap2.id
    JOIN
        (
            SELECT *
            FROM flights f
            WHERE f.quarter = ${returnQuarter} AND f.target IN (SELECT id FROM origin) -- parameterized return quarter
        ) f2 ON ap2.id = f2.start
    WHERE f1.fare + ab.night_price * ${days} + f2.fare < ${budget} -- parameterized total budget
    LIMIT 50
)
SELECT * FROM result
ORDER BY Cost ASC;
    `
    ;
  try {
    const itineraries = await executeDatabaseQuery(itineraryQuery);
    // Log the retrieved data
    console.log(itineraries);

    res.status(200).json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};




const find_featured_itinerary = async function (req, res) {
  console.log('featured');
  const { temp_min, temp_max, budget, city, state, leave_date, return_date } = req.query;
  console.log('Inputs received:', { temp_min, temp_max, budget, city, state, leave_date, return_date });
  var leave = new Date(leave_date);
  var returnDate = new Date(return_date);
  // Validate inputs...
  var leaveMonth = leave.getMonth() + 1;
  var returnMonth = returnDate.getMonth() + 1;
  var leaveQuarter = 1;
  var returnQuarter = 1;

  if (leaveMonth <= 3) {
    leaveQuarter = 1;
  } else if (leaveMonth <= 6) {
    leaveQuarter = 2;
  } else if (leaveMonth <= 9) {
    leaveQuarter = 3;
  } else {
    leaveQuarter = 4;
  }

  if (returnMonth <= 3) {
    returnQuarter = 1;
  } else if (returnMonth <= 6) {
    returnQuarter = 2;
  } else if (returnMonth <= 9) {
    returnQuarter = 3;
  } else {
    returnQuarter = 4;
  }

  function getMonthAbbreviation(monthNumber) {
    // Array of month abbreviations
    var monthAbbreviations = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dece"
    ];

    // Check if the month number is valid (between 1 and 12)
    if (monthNumber >= 1 && monthNumber <= 12) {
      // Subtract 1 to get the correct index in the array
      return monthAbbreviations[monthNumber - 1];
    } else {
      // Handle invalid month numbers
      return "Invalid month number";
    }
  }

  var leaveMonthName = getMonthAbbreviation(leaveMonth);
  var returnMonthName = getMonthAbbreviation(returnMonth);

  var difference = returnDate - leave;
  var seconds = Math.floor(difference / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  // Updated SQL query
  // const itineraryQuery1 = `SELECT * FROM destinations LIMIT 5;`
  const itineraryQuery = `
  WITH origin AS (
    SELECT
        city,
        state,
        id
    FROM
        (
            SELECT d.city as city, d.state as state, d.longitude, d.latitude
            FROM destinations d
            WHERE d.city = 'Philadelphia' AND d.state = 'PA' -- variable inputs
        ) d
        JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
 )
 SELECT DISTINCT
    o.city AS "Origin City",
    o.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    nab1.name AS "Airbnb Name",
    nab1.city AS "Airbnb City",
    nab1.state AS "Airbnb State",
    nab1.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + nab1.night_price * 3 + f2.fare AS Cost -- variable inputs
 FROM
    origin o
 JOIN
    (
        SELECT *
        FROM flights f
        WHERE f.quarter = 4 AND f.start IN (SELECT id FROM origin) -- variable inputs
    ) f1 ON o.id = f1.start
 JOIN
    nearby_cities nc ON f1.target = nc.airport_id
 JOIN
    nearby_temps nt ON nc.dest_longitude = nt.dest_longitude AND nc.dest_latitude = nt.dest_latitude
 JOIN
    (
        SELECT *
        FROM temps
        WHERE dece < 26.67 * 1.2 AND dece > 15.56 * 0.8 -- variable inputs, +/- 20% buffer
    ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
 JOIN
    most_relevant_airbnb nab1 ON f1.target = nab1.airport_id
 JOIN
    nearby_airports nap2 ON nc.dest_latitude = nap2.dest_lat AND nc.dest_longitude = nap2.dest_long
 JOIN
    airports ap2 ON nap2.id = ap2.id
 JOIN
    (
        SELECT *
        FROM flights f
        WHERE f.quarter = 4 AND f.target IN (SELECT id FROM origin) -- variable inputs
    ) f2 ON ap2.id = f2.start
 WHERE f1.fare + nab1.night_price * 3 + f2.fare < 1000 * 1.2 -- + 20% buffer
 ORDER BY Cost DESC
 LIMIT 100;
    `
    ;
  try {
    const itineraries = await executeDatabaseQuery(itineraryQuery);
    // Log the retrieved data
    console.log(itineraries);

    res.status(200).json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

const get_cart = async function (req, res) {
  try {
    const userId = req.query.user_id;
    let query = `SELECT * FROM cart WHERE user_id = '${userId}'`;

    if (req.query.airbnb_city) {
      const airbnbCity = req.query.airbnb_city;
      query += ` AND airbnb_city = '${airbnbCity}'`;
    }

    const result = await executeDatabaseQuery(query);
    res.json(result);
  } catch (error) {
    console.log('Error in GET /cart:', error);
    res.status(500).send('Internal Server Error');
  }
}


const find_group_itinerary = async function (req, res) {
  const body = req.body;
  console.log(body)
  const { leaveDate: leave_date, returnDate: return_date } = body['0'];
  const { budget: budget0, tempMin: temp_min0, tempMax: temp_max0 } = body['1'];
  const { budget: budget1, tempMin: temp_min1, tempMax: temp_max1 } = body['2'];
  const { budget: budget2, tempMin: temp_min2, tempMax: temp_max2 } = body['3'];
  const { budget: budget3, tempMin: temp_min3, tempMax: temp_max3 } = body['4'];
  console.log('Inputs received:', { leave_date, return_date, temp_min0, temp_max0, budget0, temp_min1, temp_max1, budget1, temp_min2, temp_max2, budget2, temp_min3, temp_max3, budget3 });
  var leave = new Date(leave_date);
  var returnDate = new Date(return_date);
  // Validate inputs...
  var leaveMonth = leave.getMonth() + 1;
  var returnMonth = returnDate.getMonth() + 1;
  var leaveQuarter = 1;
  var returnQuarter = 1;

  if (leaveMonth <= 3) {
    leaveQuarter = 1;
  } else if (leaveMonth <= 6) {
    leaveQuarter = 2;
  } else if (leaveMonth <= 9) {
    leaveQuarter = 3;
  } else {
    leaveQuarter = 4;
  }

  if (returnMonth <= 3) {
    returnQuarter = 1;
  } else if (returnMonth <= 6) {
    returnQuarter = 2;
  } else if (returnMonth <= 9) {
    returnQuarter = 3;
  } else {
    returnQuarter = 4;
  }

  function getMonthAbbreviation(monthNumber) {
    // Array of month abbreviations
    var monthAbbreviations = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dece"
    ];

    // Check if the month number is valid (between 1 and 12)
    if (monthNumber >= 1 && monthNumber <= 12) {
      // Subtract 1 to get the correct index in the array
      return monthAbbreviations[monthNumber - 1];
    } else {
      // Handle invalid month numbers
      return "Invalid month number";
    }
  }

  var leaveMonthName = getMonthAbbreviation(leaveMonth);
  var returnMonthName = getMonthAbbreviation(returnMonth);

  var difference = returnDate - leave;
  var seconds = Math.floor(difference / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  // Updated SQL query
  // const itineraryQuery1 = `SELECT * FROM destinations LIMIT 5;`
  const itineraryQuery = `
  WITH origin AS (
    SELECT
        city,
        state,
        id
    FROM
        (
            SELECT d.city as city, d.state as state, d.longitude, d.latitude
            FROM destinations d
            WHERE d.city = 'Philadelphia' AND d.state = 'PA' -- parameterized city and state
        ) d
        JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
 ),
 f1_ordered AS (
    SELECT *
    FROM flights f
    WHERE f.quarter = ${leaveQuarter} AND f.start IN (SELECT id FROM origin) -- parameterized leave quarter
    ORDER BY f.fare
 ),
 group_min_temp AS (
    SELECT MAX(min_temp)
    FROM group_preferences
 ),
 group_max_temp AS (
    SELECT MIN(max_temp)
    FROM group_preferences
 ),
 group_max_budget AS (
    SELECT MIN(budget)
    FROM group_preferences
 ),
 num_group_members AS (
    SELECT COUNT(*)
    FROM group_preferences
 ),
 result AS(
    SELECT DISTINCT
        o.city AS "Origin City",
        o.state AS "Origin State",
        f1.start AS "Departing Flight - From",
        f1.target AS "Departing Flight - To",
        t.dece AS "Destination Temperature",
        ab2.name AS "Airbnb Name",
        ab2.city AS "Airbnb City",
        ab2.state AS "Airbnb State",
        ab2.night_price AS "Airbnb Nightly Price",
        f2.start AS "Returning Flight - From",
        f2.target AS "Returning Flight - To",
        f1.fare + ab2.night_price * ${days} / (SELECT * FROM num_group_members) + f2.fare AS Cost
    FROM
        origin o
    JOIN f1_ordered f1 ON o.id = f1.start
    JOIN nearby_cities nc ON f1.target = nc.airport_id
    JOIN nearby_temps nt ON nc.dest_longitude = nt.dest_longitude AND nc.dest_latitude = nt.dest_latitude
    JOIN
        (
            SELECT *
            FROM temps
            WHERE dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp) -- parameterized temperature range
        ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
    JOIN nearby_airbnbs2 ab ON f1.target = ab.airport_id
    JOIN airbnbs2 ab2 ON ab.airbnb_id = ab2.id
    JOIN nearby_airports nap2 ON nc.dest_latitude = nap2.dest_lat AND nc.dest_longitude = nap2.dest_long
    JOIN airports ap2 ON nap2.id = ap2.id
    JOIN
        (
            SELECT *
            FROM flights f
            WHERE f.quarter = ${returnQuarter} AND f.target IN (SELECT id FROM origin) -- parameterized return quarter
        ) f2 ON ap2.id = f2.start
    WHERE f1.fare + ab2.night_price * ${days} / (SELECT * FROM num_group_members) + f2.fare < (SELECT * FROM group_max_budget) -- parameterized total budget
    LIMIT 100
 )
 SELECT * FROM result
 ORDER BY Cost DESC;
    `;

  try {
    console.log(itineraryQuery)
    const itineraries = await executeDatabaseQuery(itineraryQuery);
    // Log the retrieved data
    console.log(itineraries);

    res.status(200).json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};


const find_group_relavance_itinerary = async function (req, res) {
  const body = req.body;
  console.log(body)
  const { leaveDate: leave_date, returnDate: return_date } = body['0'];
  const { budget: budget0, tempMin: temp_min0, tempMax: temp_max0 } = body['1'];
  const { budget: budget1, tempMin: temp_min1, tempMax: temp_max1 } = body['2'];
  const { budget: budget2, tempMin: temp_min2, tempMax: temp_max2 } = body['3'];
  const { budget: budget3, tempMin: temp_min3, tempMax: temp_max3 } = body['4'];
  console.log('Inputs received:', { leave_date, return_date, temp_min0, temp_max0, budget0, temp_min1, temp_max1, budget1, temp_min2, temp_max2, budget2, temp_min3, temp_max3, budget3 });
  var leave = new Date(leave_date);
  var returnDate = new Date(return_date);
  // Validate inputs...
  var leaveMonth = leave.getMonth() + 1;
  var returnMonth = returnDate.getMonth() + 1;
  var leaveQuarter = 1;
  var returnQuarter = 1;

  if (leaveMonth <= 3) {
    leaveQuarter = 1;
  } else if (leaveMonth <= 6) {
    leaveQuarter = 2;
  } else if (leaveMonth <= 9) {
    leaveQuarter = 3;
  } else {
    leaveQuarter = 4;
  }

  if (returnMonth <= 3) {
    returnQuarter = 1;
  } else if (returnMonth <= 6) {
    returnQuarter = 2;
  } else if (returnMonth <= 9) {
    returnQuarter = 3;
  } else {
    returnQuarter = 4;
  }

  function getMonthAbbreviation(monthNumber) {
    // Array of month abbreviations
    var monthAbbreviations = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dece"
    ];

    // Check if the month number is valid (between 1 and 12)
    if (monthNumber >= 1 && monthNumber <= 12) {
      // Subtract 1 to get the correct index in the array
      return monthAbbreviations[monthNumber - 1];
    } else {
      // Handle invalid month numbers
      return "Invalid month number";
    }
  }

  var leaveMonthName = getMonthAbbreviation(leaveMonth);
  var returnMonthName = getMonthAbbreviation(returnMonth);

  var difference = returnDate - leave;
  var seconds = Math.floor(difference / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  // Updated SQL query
  // const itineraryQuery1 = `SELECT * FROM destinations LIMIT 5;`
  const itineraryQuery = `
  WITH origin AS (
       SELECT
           city,
           state,
           id
       FROM
           (
               SELECT d.city as city, d.state as state, d.longitude, d.latitude
               FROM destinations d
               WHERE d.city = 'Philadelphia' AND d.state = 'PA' -- parameterized city and state
           ) d
           JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
    ),
    f1_ordered AS (
       SELECT *
       FROM flights f
       WHERE f.quarter = ${leaveQuarter} AND f.start IN (SELECT id FROM origin) -- parameterized leave quarter
       ORDER BY f.fare
    ),
    group_min_temp AS (
       SELECT MAX(min_temp) * 0.8
       FROM group_preferences
    ),
    group_max_temp AS (
       SELECT MIN(max_temp) * 1.2
       FROM group_preferences
    ),
    group_max_budget AS (
       SELECT MIN(budget) * 1.2
       FROM group_preferences
    ),
    num_group_members AS (
       SELECT COUNT(*)
       FROM group_preferences
    ),
    result AS(
       SELECT DISTINCT
           o.city AS "Origin City",
           o.state AS "Origin State",
           f1.start AS "Departing Flight - From",
           f1.target AS "Departing Flight - To",
           t.dece AS "Destination Temperature",
           ab2.name AS "Airbnb Name",
           ab2.city AS "Airbnb City",
           ab2.state AS "Airbnb State",
           ab2.avg_rating AS "AvgRating",
           ab2.cancellation_score AS "CancellationScore",
           ab2.night_price AS "Airbnb Nightly Price",
           f2.start AS "Returning Flight - From",
           f2.target AS "Returning Flight - To",
           f1.fare + ab2.night_price * ${days} / (SELECT * FROM num_group_members) + f2.fare AS Cost
       FROM
           origin o
       JOIN f1_ordered f1 ON o.id = f1.start
       JOIN nearby_cities nc ON f1.target = nc.airport_id
       JOIN nearby_temps nt ON nc.dest_longitude = nt.dest_longitude AND nc.dest_latitude = nt.dest_latitude
       JOIN
           (
               SELECT longitude, latitude, dece
               FROM temps
               WHERE dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp) -- parameterized temperature range
           ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
       JOIN nearby_airbnbs2 ab ON f1.target = ab.airport_id
       JOIN airbnbs2 ab2 ON ab.airbnb_id = ab2.id
       JOIN nearby_airports nap2 ON nc.dest_latitude = nap2.dest_lat AND nc.dest_longitude = nap2.dest_long
       JOIN airports ap2 ON nap2.id = ap2.id
       JOIN
           (
               SELECT *
               FROM flights f
               WHERE f.quarter = ${returnQuarter} AND f.target IN (SELECT id FROM origin) -- parameterized return quarter
           ) f2 ON ap2.id = f2.start
       WHERE f1.fare + ab2.night_price * ${days} / (SELECT * FROM num_group_members) + f2.fare < (SELECT * FROM group_max_budget) -- parameterized total budget
       LIMIT 100
    )
    SELECT * FROM result
    ORDER BY 0.7 * (AvgRating) + 0.3 * (CancellationScore / 7) DESC, Cost DESC;
    `;

  // console.log(groupPreferencesUpload)
  // try {
  //   executeDatabaseQuery(groupPreferencesUpload);
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send('Internal server error');
  // }


  try {
    console.log(itineraryQuery)
    const itineraries = await executeDatabaseQuery(itineraryQuery);
    // Log the retrieved data
    console.log(itineraries);

    res.status(200).json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};


const add_to_cart = async function (req, res) {
  try {
    const {
      user_id, origin_city, departing_from, departing_to, dest_temp,
      airbnb_name, airbnb_city, airbnb_state, airbnb_night_price, return_from,
      return_to, price
    } = req.body;

    const query = `
        INSERT INTO cart (
            user_id, origin_city, departing_from, departing_to, dest_temp,
            airbnb_name, airbnb_city, airbnb_state, airbnb_night_price, return_from,
            return_to, price
        ) VALUES (
            '${user_id}', '${origin_city}', '${departing_from}', '${departing_to}', ${dest_temp},
            '${airbnb_name}', '${airbnb_city}', '${airbnb_state}', ${airbnb_night_price}, '${return_from}',
            '${return_to}', ${price}
        )`;

    await executeDatabaseQuery(query);
    res.status(201).send('Cart item created successfully');
  } catch (error) {
    console.error('Error in POST /cart:', error);
    res.status(500).send('Internal Server Error');
  }
}

const delete_from_cart = async function (req, res) {
  try {
    const entryId = req.params.entry_id;

    if (!entryId) {
      res.status(400).send('Missing entry_id');
      return;
    }

    const query = `DELETE FROM cart WHERE entry_id = ${entryId}`;
    console.log(query)

    await executeDatabaseQuery(query);
    res.send('Cart item deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /cart:', error);
    res.status(500).send('Internal Server Error');
  }
}



module.exports = {
  get_user_preferences,
  patch_user_preferences,
  album_songs,
  search_songs,
  random,
  find_itinerary,
  get_cart,
  add_to_cart,
  delete_from_cart,
  find_featured_itinerary,
  find_group_itinerary,
  find_group_relavance_itinerary
}
