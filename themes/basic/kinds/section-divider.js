// kind: section-divider — 章の境目を示す扉ページ。
const { buildSectionDivider } = require("../parts");

module.exports = function renderSectionDivider(slide, spec) {
  buildSectionDivider(slide, spec.label, spec.title);
};
