<div align="center">

# Gumroad Clone | [Production Site](https://photos.chrismuntean.dev/)

### Simple clone of Gumroad utilizing Square's checkout API, Firebase Authentication, Firestore Database, and Clouflare Zero Trust for securing the admin panel. Fully serverless hosted on Cloudflare Pages & Workers to save myself the 10% commission Gumroad takes 

![GitHub commit activity](https://img.shields.io/github/commit-activity/t/chrismuntean/Gumroad-Clone)
![GitHub License](https://img.shields.io/github/license/chrismuntean/Gumroad-Clone)
![GitHub branch check runs](https://img.shields.io/github/check-runs/chrismuntean/Gumroad-Clone/main)

</div>

## Deployment
Begin by cloning the repository to your local machine and pushing to your own repository:
```bash
git clone https://github.com/chrismuntean/Gumroad-Clone.git
```
<br>

### Configure environment variables
Format for `.env` file
```bash
SQUARE_ACCESS_TOKEN=<YOUR_SQUARE_ACCESS_TOKEN>
SQUARE_LOCATION_ID=<YOUR_SQUARE_LOCATION_ID>
```

Configure `firebase-init.js` with your own details
```bash
const firebaseConfig = {
  apiKey: "<YOUR_API_KEY>",
  authDomain: "<YOUR_AUTH_DOMAIN>",
  projectId: "<YOUR_PROJECT_ID>",
  storageBucket: "<YOUR_STORAGE_BUCKET>",
  messagingSenderId: "<YOUR_MESSAGING_SENDER_ID>",
  appId: "<YOUR_APP_ID>",
  measurementId: "<YOUR_MEASUREMENT_ID>"
};
```

**TIPS:**
* Sign up as a developer with Square to get a access token and location ID at [developer.squareup.com](https://developer.squareup.com)
* Get your Firebase configuration information at [console.firebase.google.com](https://console.firebase.google.com)

### Connect with Cloudflare Pages
To deploy easily with Cloudflare connect Cloudflare to your GitHub account and deploy the main branch. And configure your environment variables manually in the dashboard.