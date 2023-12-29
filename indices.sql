-- flights indices
CREATE INDEX flights_index_quarter
ON flights (quarter)
USING HASH;

CREATE INDEX flights_index_fare
ON flights (fare);

CREATE INDEX flights_index_start
ON flights (start)
USING HASH;

CREATE INDEX flights_index_target
ON flights (target)
USING HASH;

-- airbnbs2 indices
CREATE INDEX airbnbs_index_id
ON airbnbs2 (id)
USING HASH;

CREATE INDEX airbnbs_index_can_sco
ON airbnbs2 (cancellation_score);

CREATE INDEX airbnbs_index_avg_rat
ON airbnbs2 (avg_rating);

-- airports indices
CREATE INDEX airports_index_id
ON airports (id)
USING HASH;

-- destinations indices
CREATE INDEX dest_index_cit_sta
ON destinations (city, state)
USING HASH;

CREATE INDEX dest_index_city
ON destinations (city)
USING HASH;

CREATE INDEX dest_index_state
ON destinations (state)
USING HASH;

-- temps indices
CREATE INDEX temp_index_lat
ON temps (latitude)
USING HASH;

CREATE INDEX temp_index_long
ON temps (longitude)
USING HASH;

CREATE INDEX temp_index_jan
ON temps (jan);

CREATE INDEX temp_index_feb
ON temps (feb);

CREATE INDEX temp_index_mar
ON temps (mar);

CREATE INDEX temp_index_apr
ON temps (apr);

CREATE INDEX temp_index_may
ON temps (may);

CREATE INDEX temp_index_jun
ON temps (jun);

CREATE INDEX temp_index_jul
ON temps (jul);

CREATE INDEX temp_index_aug
ON temps (aug);

CREATE INDEX temp_index_sep
ON temps (sep);

CREATE INDEX temp_index_oct
ON temps (oct);

CREATE INDEX temp_index_nov
ON temps (nov);

CREATE INDEX temp_index_dec
ON temps (dece);

-- nearby_airports
CREATE INDEX na_index_dlat
ON nearby_airports (dest_lat)
USING HASH;

CREATE INDEX na_index_dlong
ON nearby_airports (dest_long)
USING HASH;

CREATE INDEX na_index_id
ON nearby_airports (id)
USING HASH;

-- nearby_temps indices
CREATE INDEX nt_index_dlat
ON nearby_temps (dest_latitude)
USING HASH;

CREATE INDEX nt_index_dlong
ON nearby_temps (dest_longitude)
USING HASH;

CREATE INDEX nt_index_tlat
ON nearby_temps (temp_latitude)
USING HASH;

CREATE INDEX nt_index_tlong
ON nearby_temps (temp_longitude)
USING HASH;

-- nearby_cities indices
CREATE INDEX nc_index_post
ON nearby_cities (dest_latitude, dest_longitude)
USING HASH;

CREATE INDEX nc_index_lat
ON nearby_cities (dest_latitude)
USING HASH;

CREATE INDEX nc_index_long
ON nearby_cities (dest_longitude)
USING HASH;

CREATE INDEX nc_index_airport
ON nearby_cities (airport_id)
USING HASH;

-- nearby_airbnbs indices
CREATE INDEX nab_index_ab
ON nearby_airbnbs2 (airbnb_id)
USING HASH;

CREATE INDEX nap_index_ap
ON nearby_airbnbs2 (airport_id)
USING HASH;
