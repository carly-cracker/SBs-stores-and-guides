// grant-admin.js
const admin = require("firebase-admin");

// Load your service account key file
const serviceAccount = require("./serviceAccountKey.json"); // make sure the filename matches

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "xkEzYVazn0Mu8gqA902mS3AGgKl1"; // 🔁 Replace with your admin UID

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin privileges granted to user: ${uid}`);
    process.exit();
  })
  .catch((error) => {
    console.error("❌ Failed to assign admin role:", error);
    process.exit(1);
  });
