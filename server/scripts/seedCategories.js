import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { category } from '../src/models/category.model.js';
dotenv.config();
const CATS = [
  { name: 'Web Development', description: 'HTML, CSS, JavaScript, React, Node.js and more' },
  { name: 'Mobile Apps', description: 'iOS, Android, React Native, Flutter' },
  { name: 'AI & Machine Learning', description: 'Python, TensorFlow, PyTorch, NLP, Computer Vision' },
  { name: 'UI/UX Design', description: 'Figma, Adobe XD, user research, prototyping' },
  { name: 'Cloud & DevOps', description: 'AWS, Azure, GCP, Docker, Kubernetes, CI/CD' },
  { name: 'Data Science', description: 'Python, pandas, SQL, data visualisation, statistics' },
];
async function main() {
  await connectDB();
  let created = 0, skipped = 0;
  for (const cat of CATS) {
    const exists = await category.findOne({ name: cat.name });
    if (exists) { console.log('Skipped: ' + cat.name); skipped++; }
    else { await category.create(cat); console.log('Created: ' + cat.name); created++; }
  }
  console.log('Done - ' + created + ' created, ' + skipped + ' skipped.');
  await mongoose.connection.close();
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
