export class TestRunner {
  constructor(container) {
    this.container = container;
    this.results = [];
    this.render();
  }

  render() {
    this.container.innerHTML = `<ul class="test-result-list"></ul>`;
    this.listEl = this.container.querySelector('.test-result-list');
  }

  showResults(results = []) {
    this.results = results;
    if (!this.listEl) this.render();
    this.listEl.innerHTML = '';
    results.forEach(r => {
      const li = document.createElement('li');
      li.className = `test-result ${r.pass ? 'pass' : 'fail'}`;
      li.textContent = r.name;
      this.listEl.appendChild(li);
    });
  }

  clear() {
    if (this.listEl) {
      this.listEl.innerHTML = '';
    }

  }
}
