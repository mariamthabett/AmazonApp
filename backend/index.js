const app = require("./app");

// التشغيل المحلي فقط: لما نشغّل `node index.js` مباشرة.
// على Vercel الملف ده مش بيتنادى — بيستوردوا app من خلال vercel.json.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
