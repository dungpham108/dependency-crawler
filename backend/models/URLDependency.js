import mongoose from 'mongoose';

const urlDependencySchema = new mongoose.Schema({
    name: String,
    type: String, // JavaScript, CSS, Image, Video
    source: String, // URL của website
});

const URLDependency = mongoose.model('URLDependency', urlDependencySchema);
export default URLDependency;
