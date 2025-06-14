// src/services/GitHubService.js
export class GitHubService {
  constructor() {
    this.token = null;
    this.octokit = null;
  }
  
  async authenticate(token) {
    const { Octokit } = await import('@octokit/rest');
    this.token = token;
    this.octokit = new Octokit({ auth: token });
    
    // Vérifier le token
    const { data: user } = await this.octokit.users.getAuthenticated();
    return user;
  }
  
  async createProgressRepo() {
    const repoName = 'codeplay-progress';
    
    try {
      // Vérifier si le repo existe
      await this.octokit.repos.get({
        owner: this.user.login,
        repo: repoName
      });
    } catch (error) {
      if (error.status === 404) {
        // Créer le repo
        await this.octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: 'Ma progression CodePlay',
          private: true,
          auto_init: true
        });
        
        // Créer la structure de base
        await this.createRepoStructure(repoName);
      }
    }
    
    return repoName;
  }
  
  async saveProgress(lessonId, code, metadata) {
    const repoName = await this.createProgressRepo();
    const date = new Date().toISOString().split('T')[0];
    const path = `lessons/${lessonId}/${date}.js`;
    
    // Sauvegarder le code
    await this.createOrUpdateFile(
      repoName,
      path,
      code,
      `Leçon ${lessonId} - ${metadata.title}`
    );
    
    // Mettre à jour le README
    await this.updateProgressReadme(repoName, lessonId, metadata);
  }
  
  async createRepoStructure(repoName) {
    const structure = [
      {
        path: 'README.md',
        content: '# Ma Progression CodePlay\n\nCe repository contient ma progression sur CodePlay.'
      },
      {
        path: 'lessons/.gitkeep',
        content: ''
      }
    ];
    
    for (const file of structure) {
      await this.createOrUpdateFile(
        repoName,
        file.path,
        file.content,
        'Structure initiale'
      );
    }
  }
}
