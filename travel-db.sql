
CREATE DATABASE travel_db;
USE travel_db;

/* destinations table */
CREATE TABLE destinations (
    latitude FLOAT NOT NULL,
	longitude FLOAT NOT NULL,
	city VARCHAR(255) NOT NULL,
	state VARCHAR(2) NOT NULL,
	PRIMARY KEY (latitude, longitude)
);

/* airbnbs table */
CREATE TABLE airbnbs (
  id INT PRIMARY KEY,
  city VARCHAR(255),
  state VARCHAR(50),
  country VARCHAR(50),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  max_stay INT,
  night_price INT,
  max_guests INT
);

/* airports table */
CREATE TABLE airports (
	id VARCHAR(3) PRIMARY KEY,
	city VARCHAR(255) NOT NULL,
	state VARCHAR(2) NOT NULL,
	latitude FLOAT NOT NULL,
	longitude FLOAT NOT NULL
);

/* commented out since temps_test has been dropped */
# CREATE TABLE temperatures AS
# SELECT *
# FROM temps_test
# WHERE country = 'United States';

/* nearby_airports table */
CREATE TABLE nearby_airports (
    dest_lat FLOAT NOT NULL,
    dest_long FLOAT NOT NULL,
    id VARCHAR(3) NOT NULL,
    PRIMARY KEY (dest_lat, dest_long, id),
    FOREIGN KEY (dest_lat, dest_long) REFERENCES destinations(latitude, longitude),
    FOREIGN KEY (id) REFERENCES airports(id)
);

INSERT INTO nearby_airports (dest_lat, dest_long, id)
SELECT d.latitude, d.longitude, a.id
FROM destinations d
CROSS JOIN airports a
WHERE a.longitude <= (d.longitude + 0.4)
    AND a.longitude >= (d.longitude - 0.4)
    AND a.latitude <= (d.latitude + 0.4)
    AND a.latitude >= (d.latitude - 0.4);

/* nearby_airbnbs table */
CREATE TABLE nearby_airbnbs (
    airport_id VARCHAR(3) NOT NULL,
    airbnb_id INT NOT NULL,
    PRIMARY KEY (airport_id, airbnb_id),
    FOREIGN KEY (airport_id) REFERENCES airports(id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnbs(id)
);

INSERT INTO nearby_airbnbs (airport_id, airbnb_id)
SELECT airports.id, airbnbs.id
FROM airports
CROSS JOIN airbnbs
WHERE airports.longitude <= (airbnbs.longitude + 1.0)
    AND airports.longitude >= (airbnbs.longitude - 1.0)
    AND airports.latitude <= (airbnbs.latitude + 1.0)
    AND airports.latitude >= (airbnbs.latitude - 1.0);


/** saving space by deleting non-US tuples **/

DELETE FROM nearby_airbnbs WHERE airbnb_id IN (SELECT id FROM airbnbs WHERE country <> 'United States');

DELETE FROM airbnbs WHERE country <> 'United States';

-- temperature range, budget, starting airport, max travel time (cumulative flight hours), leave start date, leave end date)

SELECT
    start.city, starting_airports.id, departing.id, departing.target_airport, nearby_airbnbs.airbnb_id, returning.id
FROM
    destinations start
JOIN
    nearby_airports AS starting_airports ON start.latitude = starting_airports.dest_lat and start.longitude = starting_airports.dest_long
JOIN
    flights AS departing ON starting_airports.id = departing.start_airport
JOIN
    nearby_airbnbs ON departing.target_airport = nearby_airbnbs.airport_id
JOIN
    airbnbs on nearby_airbnbs.airbnb_id = airbnbs.id
JOIN
    flights AS returning ON nearby_airbnbs.airport_id = returning.start_airport
WHERE
    start.latitude = input_lat
    AND start.longitude = input_long
    AND departing.fare_price + returning.fare_price + airbnbs.night_price * (leave_data - return_date) <= budget;



CREATE TABLE nearest_temp
(
    dest_lat  FLOAT NOT NULL,
    dest_long FLOAT NOT NULL,
    country   TEXT,
    city      TEXT,
    jan       DOUBLE,
    feb       DOUBLE,
    mar       DOUBLE,
    apr       DOUBLE,
    may       DOUBLE,
    jun       DOUBLE,
    jul       DOUBLE,
    aug       DOUBLE,
    sep       DOUBLE,
    oct       DOUBLE,
    `nov`     DOUBLE,  -- Enclosed 'nov' in backticks
    `dec`     DOUBLE,  -- Enclosed 'dec' in backticks
    avg_year  DOUBLE,
    continent TEXT,
    PRIMARY KEY (dest_lat, dest_long),
    FOREIGN KEY (dest_lat, dest_long) REFERENCES destinations (latitude, longitude)
);
=======
/* flights table */
CREATE TABLE flights (
    start VARCHAR(3) NOT NULL,
    target VARCHAR(3) NOT NULL,
    distance INT NOT NULL,
    fare float NOT NULL,
    quarter INT NOT NULL,
    FOREIGN KEY (start) REFERENCES airports(id),
    FOREIGN KEY (target) REFERENCES airports(id)
);

/* temps table */

CREATE TABLE temps (
    country text,
    city text,
    state text,
    jan double,
    feb double,
    mar double,
    apr double,
    may double,
    jun double,
    jul double,
    aug double,
    sep double,
    oct double,
    nov double,
    `dec` double,
    latitude double,
    longitude double
);

ALTER TABLE temps
ADD PRIMARY KEY (latitude, longitude);

CREATE TABLE nearby_temp (
    dest_latitude double,
    dest_longitude double,
    temp_latitude double,
    temp_longitude double,
    PRIMARY KEY (dest_latitude, dest_longitude),
    FOREIGN KEY (temp_latitude, temp_longitude) REFERENCES temps (latitude, longitude)
);


INSERT INTO nearby_temps
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
    rnk = 1;

/* nearby_cities table - for each airport, assigns closest city that exists in destinations table*/

CREATE TABLE nearby_cities (
    airport_id VARCHAR(3),
    dest_latitude FLOAT,
    dest_longitude FLOAT,
    PRIMARY KEY (airport_id),
    FOREIGN KEY (dest_latitude, dest_longitude) REFERENCES destinations (latitude, longitude),
    FOREIGN KEY (airport_id) REFERENCES airports(id)
);

INSERT INTO nearby_cities
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
    rnk = 1;
    
CREATE TABLE user_prefs(
    budget          int,
    temp_min        float,
    temp_max        int,
    user_id         varchar(255) not null
        primary key,
    travel_time_max int,
);

create table cart
(
    user_id            varchar(255) not null,
    origin_city        int          null,
    departing_from     varchar(3)   null,
    departing_to       varchar(3)   null,
    dest_temp          double       null,
    airbnb_city        varchar(255) null,
    airbnb_state       varchar(2)   null,
    airbnb_night_price int          null,
    return_from        varchar(3)   null,
    return_to          varchar(3)   null,
    price              float        null,
    entry_id           int          not null
        auto_increment primary key,
    constraint cart_user_preferences_user_id_fk
        foreign key (user_id) references travel_db.user_preferences (user_id)
);

create index cart_airbnb_city_index
    on cart (airbnb_city);


/* airbnbs2 table, with reviews*/
CREATE TABLE airbnbs2 (
  id INT PRIMARY KEY,
  city VARCHAR(255),
  state VARCHAR(50),
  country VARCHAR(50),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  max_stay INT,
  night_price INT,
  max_guests INT
);


CREATE TABLE group_preferences (
    min_temp INT,
    max_temp INT,
    budget INT,
    leave_year INT,
    leave_month INT,
    leave_day INT,
    return_year INT,
    return_month INT,
    return_day INT
);

ALTER TABLE group_preferences
DROP leave_year, DROP leave_month, DROP leave_day, DROP return_year, DROP return_month, DROP return_day;

/* nearby_airbnbs2 table */
CREATE TABLE nearby_airbnbs2 (
    airport_id VARCHAR(3) NOT NULL,
    airbnb_id INT NOT NULL,
    PRIMARY KEY (airport_id, airbnb_id),
    FOREIGN KEY (airport_id) REFERENCES airports(id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnbs2(id)
);

INSERT INTO nearby_airbnbs2 (airport_id, airbnb_id)
SELECT airports.id, airbnbs2.id
FROM airports
CROSS JOIN airbnbs2
WHERE airports.longitude <= (airbnbs2.longitude + 1.0)
    AND airports.longitude >= (airbnbs2.longitude - 1.0)
    AND airports.latitude <= (airbnbs2.latitude + 1.0)
    AND airports.latitude >= (airbnbs2.latitude - 1.0);

/** saving space by deleting non-US tuples **/

DELETE FROM nearby_airbnbs2 WHERE airbnb_id IN (SELECT id FROM airbnbs2 WHERE country <> 'United States');

DELETE FROM airbnbs2 WHERE country <> 'United States';

/** adding cancellation score **/

ALTER TABLE airbnbs2
ADD COLUMN cancellation_score INT;

UPDATE airbnbs2
SET cancellation_score =
  CASE cancellation_policy
    WHEN 'no_refund' THEN 1
    WHEN 'super_strict_30' THEN 2
    WHEN 'super_strict_60' THEN 3
    WHEN 'strict' THEN 4
    WHEN 'moderate' THEN 5
    WHEN 'flexible' THEN 6
    WHEN 'long_term' THEN 7
  END;

/** dropping airbnbs with $0 price, other cleaning **/

DELETE FROM nearby_airbnbs2 WHERE airbnb_id in (SELECT id FROM airbnbs2 WHERE night_price = 0);

DELETE FROM airbnbs2 WHERE night_price = 0;

DELETE FROM nearby_airbnbs2 WHERE airbnb_id in (SELECT id FROM airbnbs2 WHERE airbnbs2.name = 'This is only a test do not rent');

DELETE FROM airbnbs2 WHERE name = 'This is only a test do not rent';

SELECT COUNT(*)
FROM nearby_airbnbs2;



    
CREATE TABLE user_preferences(
    user_id         varchar(255) not null primary key,
    budget          float,
    temp_min        float,
    temp_max        float,
    city            varchar(255),
    state           varchar(255),
    leave_date      date,
    return_date     date
);

create table cart
(
    user_id            varchar(255) not null,
    origin_city        int          null,
    departing_from     varchar(3)   null,
    departing_to       varchar(3)   null,
    dest_temp          double       null,
    airbnb_city        varchar(255) null,
    airbnb_state       varchar(2)   null,
    airbnb_night_price int          null,
    return_from        varchar(3)   null,
    return_to          varchar(3)   null,
    price              float        null,
    entry_id           int          not null
        auto_increment primary key,
    constraint cart_user_preferences_user_id_fk
        foreign key (user_id) references travel_db.user_preferences (user_id)
);

create index cart_airbnb_city_index
    on cart (airbnb_city);

CREATE TABLE cheapest_airbnb (
    airport_id CHAR(3),
    airbnb_id INT,
    name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    night_price DECIMAL(10, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (airport_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnbs2(id)
);

INSERT INTO cheapest_airbnb (airport_id, airbnb_id, name, city, state, night_price)
SELECT
    nab.airport_id,
    a.id,
    a.name,
    a.city,
    a.state,
    a.night_price
FROM nearby_airbnbs2 nab
JOIN airbnbs2 a ON nab.airbnb_id = a.id
WHERE a.night_price IS NOT NULL AND a.country = 'United States'
ORDER BY nab.airport_id, a.night_price DESC
ON DUPLICATE KEY UPDATE
    airbnb_id = VALUES(airbnb_id),
    name = VALUES(name),
    city = VALUES(city),
    state = VALUES(state),
    night_price = VALUES(night_price),
    last_updated = NOW();

CREATE TABLE most_relevant_airbnb (
    airport_id CHAR(3),
    airbnb_id INT,
    name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    night_price DECIMAL(10, 2),
    avg_rating FLOAT,
    cancellation VARCHAR(20),
    PRIMARY KEY (airport_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnbs2(id)
);

INSERT INTO most_relevant_airbnb (airport_id, airbnb_id, name, city, state, night_price, avg_rating, cancellation)
SELECT
    nab.airport_id,
    a.id,
    a.name,
    a.city,
    a.state,
    a.night_price,
    a.avg_rating,
    a.cancellation_policy
FROM nearby_airbnbs2 nab
JOIN airbnbs2 a ON nab.airbnb_id = a.id
WHERE a.night_price IS NOT NULL AND a.country = 'United States'
ORDER BY nab.airport_id, 0.7 * (a.avg_rating) + 0.3 * (a.cancellation_score / 7) ASC
ON DUPLICATE KEY UPDATE
    airbnb_id = VALUES(airbnb_id),
    name = VALUES(name),
    city = VALUES(city),
    state = VALUES(state),
    night_price = VALUES(night_price),
    avg_rating = VALUES(avg_rating),
    cancellation = VALUES(cancellation)