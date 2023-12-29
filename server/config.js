const env = process.env.NODE_ENV

const server_host = env === 'production' ? 'https://backend-for-vacation-planner.onrender.com' : 'http://localhost'

const server_port = env === 'production' ? '443' : '8080'

const config = {
  "rds_host": "travel-db.cr5qeg6j766j.us-east-2.rds.amazonaws.com",
  "rds_port": "3306",
  "rds_user": "admin",
  "rds_password": "Nai17AFnb01epI",
  "rds_db": "travel_db",
  "server_host": server_host,
  "server_port": server_port
}


module.exports = config;