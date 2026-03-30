const test = require("node:test");
const assert = require("node:assert/strict");

const {
  filterNotes,
  getSelectedNote,
  shouldShowPlaceholder,
  isFormattedNote,
  toggleNotesHidden
} = require("../src/noteUtils");

const sampleNotes = [
  {
    id: "1",
    name: "Shopping",
    fullName: "Shopping.txt",
    type: "txt",
    content: "milk"
  },
  {
    id: "2",
    name: "Ideas",
    fullName: "Ideas.md",
    type: "md",
    content: "# Heading",
    formatted: true
  },
  {
    id: "3",
    name: "Todo",
    fullName: "Todo.txt",
    type: "txt",
    content: ""
  }
];

test("filterNotes returns matching files case-insensitively", () => {
  const result = filterNotes(sampleNotes, "ideas");
  assert.equal(result.length, 1);
  assert.equal(result[0].fullName, "Ideas.md");
});

test("getSelectedNote returns the correct note by id", () => {
  const result = getSelectedNote(sampleNotes, "2");
  assert.ok(result);
  assert.equal(result.name, "Ideas");
});

test("shouldShowPlaceholder is true for empty note content", () => {
  const result = shouldShowPlaceholder(sampleNotes[2]);
  assert.equal(result, true);
});

test("isFormattedNote is true for markdown notes", () => {
  const result = isFormattedNote(sampleNotes[1]);
  assert.equal(result, true);
});

test("toggleNotesHidden flips the current hidden state", () => {
  assert.equal(toggleNotesHidden(false), true);
  assert.equal(toggleNotesHidden(true), false);
});