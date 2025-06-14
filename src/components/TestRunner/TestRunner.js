export class TestRunner {
  constructor(container) {
    this.container = container;
    this.results = [];
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="test-runner">
        <ul class="test-results"></ul>
      </div>
    `;
    this.list = this.container.querySelector(".test-results");
  }

  showResults(results = []) {
    this.results = Array.isArray(results) ? results : [];
    this.render();
  }

  render() {
    this.list.innerHTML = this.results
      .map(
        (r) => `
        <li class="test-item ${r.pass ? "pass" : "fail"}">
          <span class="result-icon">${r.pass ? "✅" : "❌"}</span>
          <span class="result-name">${r.name}</span>
        </li>
      `,
      )
      .join("");
  }
}
