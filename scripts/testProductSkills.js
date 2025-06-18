const { getProductManagementSkills } = require('../src/services/weaviate');

(async () => {
  try {
    const skills = await getProductManagementSkills();
    console.log('\nTop Product Management Accomplishments:');
    skills.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.text} (distance: ${item.distance})`);
    });
  } catch (err) {
    console.error('Error fetching product management skills:', err);
  }
})();
