import mongoose from 'mongoose';

const configDependencySchema = new mongoose.Schema({
    name: String,
    version: String,
    type: String, // NPM, Maven
    source: String, // Pubic repo: owner/repo
});

const ConfigDependency = mongoose.model('ConfigDependency', configDependencySchema);
export default ConfigDependency;
