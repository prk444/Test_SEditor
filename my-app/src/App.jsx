import React, { useRef, useState, useEffect } from "react";
import "./App.css";

const ScriptEditor = () => {
  const editorRef = useRef(null);
  const [blockType, setBlockType] = useState("action");
  const [sceneCount, setSceneCount] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("scriptData");
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef.current) {
        localStorage.setItem("scriptData", editorRef.current.innerHTML);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const currentNode = sel.anchorNode;
    if (!editorRef.current.contains(currentNode)) return;

    e.preventDefault();

    const currentBlock =
      currentNode.nodeType === 3 ? currentNode.parentNode : currentNode;
    const currentType = currentBlock.getAttribute("data-type");

    let nextType = blockType;
    if (currentType === "scene-heading") nextType = "action";
    else if (currentType === "action") nextType = "character";
    else if (currentType === "character") nextType = "dialogue";
    else if (currentType === "dialogue") nextType = "action";

    const newBlock = document.createElement("div");
    newBlock.setAttribute("data-type", nextType);
    newBlock.className = `block ${nextType}`;
    newBlock.contentEditable = "true";

    if (nextType === "scene-heading") {
      newBlock.textContent = `INT./EXT. SCENE ${sceneCount}`;
      setSceneCount((prev) => prev + 1);
    } else if (nextType === "character") {
      newBlock.textContent = "CHARACTER NAME";
    } else {
      newBlock.innerHTML = "<br>";
    }

    if (currentBlock.nextSibling) {
      editorRef.current.insertBefore(newBlock, currentBlock.nextSibling);
    } else {
      editorRef.current.appendChild(newBlock);
    }

    const range = document.createRange();
    range.selectNodeContents(newBlock);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    setBlockType(nextType);
  };

  const applyBlockStyle = (block, type) => {
    block.setAttribute("data-type", type);
    block.className = `block ${type}`;
    block.contentEditable = "true";

    if (type === "scene-heading") {
      block.textContent = `INT./EXT. SCENE ${sceneCount}`;
      setSceneCount((prev) => prev + 1);
    } else if (type === "character") {
      block.textContent = "CHARACTER NAME";
    } else {
      block.innerHTML = "<br>";
    }
  };

  const handleAddBlock = () => {
    const newBlock = document.createElement("div");
    applyBlockStyle(newBlock, blockType);
    editorRef.current.appendChild(newBlock);

    const range = document.createRange();
    range.selectNodeContents(newBlock);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleShortcut = (e) => {
    if (!e.altKey) return;
    if (e.key === "1") updateCurrentBlockType("scene-heading");
    if (e.key === "2") updateCurrentBlockType("action");
    if (e.key === "3") updateCurrentBlockType("character");
    if (e.key === "4") updateCurrentBlockType("dialogue");
  };

  const updateCurrentBlockType = (newType) => {
    setBlockType(newType);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const currentNode = sel.anchorNode;
    if (!editorRef.current.contains(currentNode)) return;

    const currentBlock =
      currentNode.nodeType === 3 ? currentNode.parentNode : currentNode;

    currentBlock.setAttribute("data-type", newType);
    currentBlock.className = `block ${newType}`;

    if (newType === "scene-heading") {
      currentBlock.textContent = `INT./EXT. SCENE ${sceneCount}`;
      setSceneCount((prev) => prev + 1);
    } else if (newType === "character") {
      currentBlock.textContent = "CHARACTER NAME";
    }
  };

  return (
    <div className="editor-container" onKeyDown={handleShortcut}>
      <header className="editor-header">
        <h1>SCRIPT TITLE</h1>
        <h2>Written by AUTHOR NAME</h2>
      </header>

      <div className="toolbar">
        <select
          value={blockType}
          onChange={(e) => updateCurrentBlockType(e.target.value)}
        >
          <option value="scene-heading">Scene Heading</option>
          <option value="action">Action</option>
          <option value="character">Character</option>
          <option value="dialogue">Dialogue</option>
        </select>
        <button onClick={handleAddBlock}>+ Add Block</button>
      </div>

      <section
        ref={editorRef}
        className="script-editor"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
      >
        <div className="block action" data-type="action">
          Start writing your screenplay...
        </div>
      </section>

      <footer className="editor-tip">
        💡 Tip: Use <b>Alt+1</b> Scene | <b>Alt+2</b> Action |{" "}
        <b>Alt+3</b> Character | <b>Alt+4</b> Dialogue
      </footer>
    </div>
  );
};

export default ScriptEditor;