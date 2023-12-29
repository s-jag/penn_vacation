-- optimized individual selection (budget)

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
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + ab.night_price * 3 + f2.fare AS Cost -- variable inputs
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
        WHERE dece < 26.67 AND dece > 15.56 -- variable inputs
    ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
JOIN
    nearby_airbnbs2 nab1 ON f1.target = nab1.airport_id
JOIN
    (
        SELECT *
        FROM airbnbs2 a
        WHERE 1000 / 3 >= a.night_price -- variable inputs
    ) ab ON nab1.airbnb_id = ab.id
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
WHERE f1.fare + ab.night_price * 3 + f2.fare < 1000
ORDER BY Cost
LIMIT 100;

-- unoptimized individual selection (budget)

WITH nc AS (
    WITH RankedCities AS (
        SELECT
            a.id AS a_id,
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(a.longitude, a.latitude))) AS rnk
        FROM
            airports a
        JOIN
            destinations d ON a.state = d.state
    )
    SELECT
        a_id,
        d_lat,
        d_lon
    FROM
        RankedCities
    WHERE
        rnk = 1
),
nt AS (
    WITH RankedTemps AS (
        SELECT
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            t.latitude AS t_lat,
            t.longitude AS t_lon,
            ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude)) AS dist,
            ROW_NUMBER() OVER (PARTITION BY d.latitude, d.longitude ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude))) AS rnk
        FROM
            destinations d
        CROSS JOIN
            temps t
    )
    SELECT
        d_lat,
        d_lon,
        t_lat,
        t_lon
    FROM
        RankedTemps
    WHERE
        rnk = 1
),
nab AS (
    SELECT airports.id as apid, airbnbs2.id as abid
    FROM airports
    CROSS JOIN airbnbs2
    WHERE airports.longitude <= (airbnbs2.longitude + 1.0)
        AND airports.longitude >= (airbnbs2.longitude - 1.0)
        AND airports.latitude <= (airbnbs2.latitude + 1.0)
        AND airports.latitude >= (airbnbs2.latitude - 1.0)
),
nap1 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
),
nap2 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
)
SELECT DISTINCT
    d.city AS "Origin City",
    d.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + ab.night_price * 3 + f2.fare AS Cost -- variable inputs
FROM
    destinations d
JOIN
    nap1 ON nap1.d_long = d.longitude AND nap1.d_lati = d.latitude
JOIN
    flights f1 ON nap1.apid = f1.start
JOIN
    nc ON f1.target = nc.a_id
JOIN
    nt ON nc.d_lon = nt.d_lon AND nc.d_lat = nt.d_lat
JOIN
    temps t ON nt.t_lon = t.longitude AND nt.t_lat = t.latitude
JOIN
    nab ON f1.target = nab.apid
JOIN
    airbnbs2 ab ON nab.abid = ab.id
JOIN
    nap2 ON nc.d_lat = nap2.d_lati AND nc.d_lon = nap2.d_long
JOIN
    airports ap2 ON nap2.apid = ap2.id
JOIN
    flights f2 ON ap2.id = f2.start
WHERE d.city = 'Philadelphia' AND d.state = 'PA' AND f1.fare + ab.night_price * 3 + f2.fare < 1000 AND f1.quarter = 4 AND dece < 26.67 AND dece > 15.56 AND f2.quarter = 4
# ORDER BY Cost
LIMIT 100;


-- optimized individual selection (relevance), need to add airbnb review to the dataset

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
ORDER BY Cost
LIMIT 100;

-- unoptimized individual selection (relevance), loose adherence to budgetary/temperature constraints

WITH nc AS (
    WITH RankedCities AS (
        SELECT
            a.id AS a_id,
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(a.longitude, a.latitude))) AS rnk
        FROM
            airports a
        JOIN
            destinations d ON a.state = d.state
    )
    SELECT
        a_id,
        d_lat,
        d_lon
    FROM
        RankedCities
    WHERE
        rnk = 1
),
nt AS (
    WITH RankedTemps AS (
        SELECT
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            t.latitude AS t_lat,
            t.longitude AS t_lon,
            ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude)) AS dist,
            ROW_NUMBER() OVER (PARTITION BY d.latitude, d.longitude ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude))) AS rnk
        FROM
            destinations d
        CROSS JOIN
            temps t
    )
    SELECT
        d_lat,
        d_lon,
        t_lat,
        t_lon
    FROM
        RankedTemps
    WHERE
        rnk = 1
),
nab AS (
    SELECT airports.id as apid, airbnbs2.id as abid
    FROM airports
    CROSS JOIN airbnbs2
    WHERE airports.longitude <= (airbnbs2.longitude + 1.0)
        AND airports.longitude >= (airbnbs2.longitude - 1.0)
        AND airports.latitude <= (airbnbs2.latitude + 1.0)
        AND airports.latitude >= (airbnbs2.latitude - 1.0)
),
nap1 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
),
nap2 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
)
SELECT DISTINCT
    d.city AS "Origin City",
    d.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + ab.night_price * 3 + f2.fare AS Cost -- variable inputs
FROM
    destinations d
JOIN
    nap1 ON nap1.d_long = d.longitude AND nap1.d_lati = d.latitude
JOIN
    flights f1 ON nap1.apid = f1.start
JOIN
    nc ON f1.target = nc.a_id
JOIN
    nt ON nc.d_lon = nt.d_lon AND nc.d_lat = nt.d_lat
JOIN
    temps t ON nt.t_lon = t.longitude AND nt.t_lat = t.latitude
JOIN
    nab ON f1.target = nab.apid
JOIN
    airbnbs2 ab ON nab.abid = ab.id
JOIN
    nap2 ON nc.d_lat = nap2.d_lati AND nc.d_lon = nap2.d_long
JOIN
    airports ap2 ON nap2.apid = ap2.id
JOIN
    flights f2 ON ap2.id = f2.start
WHERE d.city = 'Philadelphia' AND d.state = 'PA' AND f1.fare + ab.night_price * 3 + f2.fare < 1000 * 1.2 AND f1.quarter = 4 AND dece < 26.67 * 1.2 AND dece > 15.56 * 0.8 AND f2.quarter = 4
# ORDER BY 0.7 * (ab.avg_rating) + 0.3 * (ab.cancellation_score / 7), Cost
LIMIT 100;

-- clearing and writing to group_preferences

DELETE FROM group_preferences;
INSERT INTO group_preferences
VALUES
    (13, 29, 1000),
    (14, 28, 1100),
    (15, 27, 1200),
    (15, 26, 1300);

-- optimized group selection (budget)

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
    WHERE f.quarter = 4 AND f.start IN (SELECT id FROM origin) -- parameterized leave quarter
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
        ab.name AS "Airbnb Name",
        ab.city AS "Airbnb City",
        ab.state AS "Airbnb State",
        ab.night_price AS "Airbnb Nightly Price",
        f2.start AS "Returning Flight - From",
        f2.target AS "Returning Flight - To",
        f1.fare + ab.night_price * 3 / (SELECT * FROM num_group_members) + f2.fare AS Cost
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

-----------------------------------------------------

WITH origin AS (
    SELECT
        city,
        state,
        id
    FROM
        (
            SELECT d.city as city, d.state as state, d.longitude, d.latitude
            FROM destinations d
            WHERE d.city = 'Philadelphia' AND d.state = 'PA' -- fixed inputs
        ) d
        JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
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
)
SELECT DISTINCT
    o.city AS "Origin City",
    o.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + ab.night_price / (SELECT * FROM num_group_members) + f2.fare AS IndividualCost -- variable inputs
FROM
    origin o
JOIN
    (
        SELECT *
        FROM flights f
        WHERE f.quarter = 4 AND f.start IN (SELECT id FROM origin) -- variable input
    ) f1 ON o.id = f1.start
JOIN
    nearby_cities nc ON f1.target = nc.airport_id
JOIN
    nearby_temps nt ON nc.dest_longitude = nt.dest_longitude AND nc.dest_latitude = nt.dest_latitude
JOIN
    (
        SELECT *
        FROM temps
        WHERE dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp)
    ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
JOIN
    nearby_airbnbs2 nab1 ON f1.target = nab1.airport_id
JOIN
    (
        SELECT *
        FROM airbnbs2 a
        WHERE (SELECT * FROM group_max_budget) / 3 >= a.night_price / (SELECT * FROM num_group_members) -- variable inputs
    ) ab ON nab1.airbnb_id = ab.id
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
WHERE f1.fare + ab.night_price / (SELECT * FROM num_group_members) + f2.fare < (SELECT * FROM group_max_budget)
ORDER BY IndividualCost
LIMIT 100;

-- unoptimized group selection (budget)

WITH nc AS (
    WITH RankedCities AS (
        SELECT
            a.id AS a_id,
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(a.longitude, a.latitude))) AS rnk
        FROM
            airports a
        JOIN
            destinations d ON a.state = d.state
    )
    SELECT
        a_id,
        d_lat,
        d_lon
    FROM
        RankedCities
    WHERE
        rnk = 1
),
nt AS (
    WITH RankedTemps AS (
        SELECT
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            t.latitude AS t_lat,
            t.longitude AS t_lon,
            ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude)) AS dist,
            ROW_NUMBER() OVER (PARTITION BY d.latitude, d.longitude ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude))) AS rnk
        FROM
            destinations d
        CROSS JOIN
            temps t
    )
    SELECT
        d_lat,
        d_lon,
        t_lat,
        t_lon
    FROM
        RankedTemps
    WHERE
        rnk = 1
),
nab AS (
    SELECT airports.id as apid, airbnbs2.id as abid
    FROM airports
    CROSS JOIN airbnbs2
    WHERE airports.longitude <= (airbnbs2.longitude + 1.0)
        AND airports.longitude >= (airbnbs2.longitude - 1.0)
        AND airports.latitude <= (airbnbs2.latitude + 1.0)
        AND airports.latitude >= (airbnbs2.latitude - 1.0)
),
nap1 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
),
nap2 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
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
)
SELECT DISTINCT
    d.city AS "Origin City",
    d.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + (ab.night_price / (SELECT * FROM num_group_members)) * 3 + f2.fare AS IndividualCost -- variable inputs
FROM
    destinations d
JOIN
    nap1 ON nap1.d_long = d.longitude AND nap1.d_lati = d.latitude
JOIN
    flights f1 ON nap1.apid = f1.start
JOIN
    nc ON f1.target = nc.a_id
JOIN
    nt ON nc.d_lon = nt.d_lon AND nc.d_lat = nt.d_lat
JOIN
    temps t ON nt.t_lon = t.longitude AND nt.t_lat = t.latitude
JOIN
    nab ON f1.target = nab.apid
JOIN
    airbnbs2 ab ON nab.abid = ab.id
JOIN
    nap2 ON nc.d_lat = nap2.d_lati AND nc.d_lon = nap2.d_long
JOIN
    airports ap2 ON nap2.apid = ap2.id
JOIN
    flights f2 ON ap2.id = f2.start
WHERE d.city = 'Philadelphia' AND d.state = 'PA' AND f1.fare + (ab.night_price / (SELECT * FROM num_group_members)) * 3 + f2.fare < (SELECT * FROM group_max_budget) AND f1.quarter = 4 AND dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp) AND f2.quarter = 4
# ORDER BY IndividualCost
LIMIT 100;

-- optimized group selection (relevance)

WITH origin AS (
    SELECT
        city,
        state,
        id
    FROM
        (
            SELECT d.city as city, d.state as state, d.longitude, d.latitude
            FROM destinations d
            WHERE d.city = 'Philadelphia' AND d.state = 'PA' -- fixed inputs
        ) d
        JOIN nearby_airports na ON na.dest_long = d.longitude AND na.dest_lat = d.latitude
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
)
SELECT DISTINCT
    o.city AS "Origin City",
    o.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + ab.night_price / (SELECT * FROM num_group_members) + f2.fare AS IndividualCost -- variable inputs
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
        WHERE dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp)
    ) t ON nt.temp_longitude = t.longitude AND nt.temp_latitude = t.latitude
JOIN
    nearby_airbnbs2 nab1 ON f1.target = nab1.airport_id
JOIN
    (
        SELECT *
        FROM airbnbs2 a
        WHERE (SELECT * FROM group_max_budget) / 3 >= a.night_price / (SELECT * FROM num_group_members) -- variable inputs
    ) ab ON nab1.airbnb_id = ab.id
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
WHERE f1.fare + ab.night_price / (SELECT * FROM num_group_members) + f2.fare < (SELECT * FROM group_max_budget)
# ORDER BY 0.7 * (ab.avg_rating) + 0.3 * (ab.cancellation_score / 7), IndividualCost
LIMIT 100;

-- unoptimized group selection (relevance)

WITH nc AS (
    WITH RankedCities AS (
        SELECT
            a.id AS a_id,
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(a.longitude, a.latitude))) AS rnk
        FROM
            airports a
        JOIN
            destinations d ON a.state = d.state
    )
    SELECT
        a_id,
        d_lat,
        d_lon
    FROM
        RankedCities
    WHERE
        rnk = 1
),
nt AS (
    WITH RankedTemps AS (
        SELECT
            d.latitude AS d_lat,
            d.longitude AS d_lon,
            t.latitude AS t_lat,
            t.longitude AS t_lon,
            ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude)) AS dist,
            ROW_NUMBER() OVER (PARTITION BY d.latitude, d.longitude ORDER BY ST_Distance_Sphere(POINT(d.longitude, d.latitude), POINT(t.longitude, t.latitude))) AS rnk
        FROM
            destinations d
        CROSS JOIN
            temps t
    )
    SELECT
        d_lat,
        d_lon,
        t_lat,
        t_lon
    FROM
        RankedTemps
    WHERE
        rnk = 1
),
nab AS (
    SELECT airports.id as apid, airbnbs2.id as abid
    FROM airports
    CROSS JOIN airbnbs2
    WHERE airports.longitude <= (airbnbs2.longitude + 1.0)
        AND airports.longitude >= (airbnbs2.longitude - 1.0)
        AND airports.latitude <= (airbnbs2.latitude + 1.0)
        AND airports.latitude >= (airbnbs2.latitude - 1.0)
),
nap1 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
),
nap2 AS (
    SELECT d.latitude as d_lati, d.longitude AS d_long, a.id as apid
    FROM destinations d
    CROSS JOIN airports a
    WHERE a.longitude <= (d.longitude + 1.0)
        AND a.longitude >= (d.longitude - 1.0)
        AND a.latitude <= (d.latitude + 1.0)
        AND a.latitude >= (d.latitude - 1.0)
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
)
SELECT DISTINCT
    d.city AS "Origin City",
    d.state AS "Origin State",
    f1.start AS "Departing Flight - From",
    f1.target AS "Departing Flight - To",
    t.dece AS "Destination Temperature",
    ab.name AS "Airbnb Name",
    ab.city AS "Airbnb City",
    ab.state AS "Airbnb State",
    ab.night_price AS "Airbnb Nightly Price",
    f2.start AS "Returning Flight - From",
    f2.target AS "Returning Flight - To",
    f1.fare + (ab.night_price / (SELECT * FROM num_group_members)) * 3 + f2.fare AS IndividualCost -- variable inputs
FROM
    destinations d
JOIN
    nap1 ON nap1.d_long = d.longitude AND nap1.d_lati = d.latitude
JOIN
    flights f1 ON nap1.apid = f1.start
JOIN
    nc ON f1.target = nc.a_id
JOIN
    nt ON nc.d_lon = nt.d_lon AND nc.d_lat = nt.d_lat
JOIN
    temps t ON nt.t_lon = t.longitude AND nt.t_lat = t.latitude
JOIN
    nab ON f1.target = nab.apid
JOIN
    airbnbs2 ab ON nab.abid = ab.id
JOIN
    nap2 ON nc.d_lat = nap2.d_lati AND nc.d_lon = nap2.d_long
JOIN
    airports ap2 ON nap2.apid = ap2.id
JOIN
    flights f2 ON ap2.id = f2.start
WHERE d.city = 'Philadelphia' AND d.state = 'PA' AND f1.fare + (ab.night_price / (SELECT * FROM num_group_members)) * 3 + f2.fare < (SELECT * FROM group_max_budget) AND f1.quarter = 4 AND dece < (SELECT * FROM group_max_temp) AND dece > (SELECT * FROM group_min_temp) AND f2.quarter = 4
# ORDER BY IndividualCost
LIMIT 100;