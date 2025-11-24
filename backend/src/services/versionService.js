import Version from '../models/version.js';

export async function generateVersionTag(projectId, type) {
    const lastVersion = await Version.findOne({ project: projectId }).sort({ createdAt: -1 });
    if (!lastVersion) {
        return type === 'major' ? 'v1.0.0' : type === 'minor' ? 'v0.1.0' : 'v0.0.1';
    }
    const [major, minor, patch] = lastVersion.tag.slice(1).split('.').map(Number);
    if (type === 'major') {
        return `v${major + 1}.0.0`;
    } else if (type === 'minor') {
        return `v${major}.${minor + 1}.0`;
    } else {
        return `v${major}.${minor}.${patch + 1}`;
    }
}

export async function newVersion(sprint, type, description = '') {
    if(!['major', 'minor', 'patch'].includes(type)) {
        throw new Error('Invalid version type');
    }
    if (description === '') {
        description = `Release for sprint ${sprint.name}`;
    }
    const tag = await generateVersionTag(sprint.project, type);
    const version = new Version({
        project: sprint.project,
        tag,
        description,
        releaseDate: new Date(),
        sprint: sprint._id
    });
    return version.save();
}
