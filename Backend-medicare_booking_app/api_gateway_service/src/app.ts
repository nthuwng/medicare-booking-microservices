import express from "express";
import "dotenv/config";
import { createProxyMiddleware } from "http-proxy-middleware";


const app = express();
const port = process.env.PORT || 8080;

const SERVICES = {
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://user-service:8081',
  APPOINTMENT_SERVICE: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:8082',
  DOCTOR_SERVICE: process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:8083',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8084',
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8085',
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://auth-service:8086',
  RATING_SERVICE: process.env.RATING_SERVICE_URL || 'http://rating-service:8087',
};

app.use('/api/users', createProxyMiddleware({
  target: SERVICES.USER_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': ''
  }
}));

app.use('/api/appointment', createProxyMiddleware({
  target: SERVICES.APPOINTMENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/appointment': ''
  }
}));

app.use('/api/doctor', createProxyMiddleware({
  target: SERVICES.DOCTOR_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/doctor': ''
  }
}));

app.use('/api/notification', createProxyMiddleware({
  target: SERVICES.NOTIFICATION_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notification': ''
  }
}));

app.use('/api/payment', createProxyMiddleware({
  target: SERVICES.PAYMENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payment': ''
  }
}));

app.use('/api/auth', createProxyMiddleware({
  target: SERVICES.AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  }
}));

app.use('/api/rating', createProxyMiddleware({
  target: SERVICES.RATING_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/rating': ''
  }
}));


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
