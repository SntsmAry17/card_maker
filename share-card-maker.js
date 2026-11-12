(() => {
  const canvas = document.querySelector("#preview");
  const ctx = canvas.getContext("2d");
  const typeSelect = document.querySelector("#card-type");
  const questionFields = document.querySelector("#question-fields");
  const doodleFields = document.querySelector("#doodle-fields");
  const questionInput = document.querySelector("#question");
  const noteInput = document.querySelector("#doodle-note");
  const doodleInput = document.querySelector("#doodle-file");
  const downloadButton = document.querySelector("#download");
  const shareButton = document.querySelector("#share");
  const status = document.querySelector("#status");
  const image = new Image();
  let hasDoodle = false;
  let doodleObjectUrl = null;

  const palette = {
    paper: "#e7e6e2",
    card: "#f8f7f4",
    ink: "#171717",
    mid: "#777773"
  };

  function setStatus(message) {
    status.textContent = message;
  }

  function drawTexture() {
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = palette.mid;
    for (let y = 36; y < canvas.height; y += 30) {
      for (let x = 36 + (Math.floor(y / 30) % 2) * 14; x < canvas.width; x += 30) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();
  }

  function wrapText(text, maxWidth, font) {
    ctx.font = font;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawWrapped(text, x, y, maxWidth, fontSize, maxLines, lineHeight) {
    const font = `600 ${fontSize}px "Trebuchet MS", Arial, sans-serif`;
    let lines = wrapText(text, maxWidth, font);
    let size = fontSize;
    while (lines.length > maxLines && size > 30) {
      size -= 2;
      lines = wrapText(text, maxWidth, `600 ${size}px "Trebuchet MS", Arial, sans-serif`);
    }
    const shown = lines.slice(0, maxLines);
    if (lines.length > maxLines && shown.length) {
      let last = shown[shown.length - 1];
      ctx.font = `600 ${size}px "Trebuchet MS", Arial, sans-serif`;
      while (last.length && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      shown[shown.length - 1] = `${last.trimEnd()}…`;
    }
    ctx.font = `600 ${size}px "Trebuchet MS", Arial, sans-serif`;
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const step = lineHeight * (size / fontSize);
    const startY = y - ((shown.length - 1) * step) / 2;
    shown.forEach((line, index) => ctx.fillText(line, x, startY + index * step, maxWidth));
  }

  function drawDoodle() {
    const box = { x: 138, y: 315, w: 804, h: 535 };
    ctx.fillStyle = "#fff";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    if (!hasDoodle || !image.complete || !image.naturalWidth) {
      ctx.fillStyle = palette.mid;
      ctx.font = '24px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOUR DOODLE WILL LIVE HERE", canvas.width / 2, canvas.height / 2);
      return;
    }

    const scale = Math.min((box.w - 36) / image.naturalWidth, (box.h - 36) / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.drawImage(image, box.x + (box.w - width) / 2, box.y + (box.h - height) / 2, width, height);
  }

  function render() {
    drawTexture();
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 4;
    ctx.fillStyle = palette.card;
    ctx.fillRect(65, 65, 950, 1070);
    ctx.strokeRect(65, 65, 950, 1070);

    ctx.fillStyle = palette.ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = '700 26px "Courier New", monospace';
    ctx.fillText("SANKAA_VELT", 120, 132);
    ctx.textAlign = "right";
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText("A LITTLE INBOX KEEPSAKE", 960, 132);
    ctx.beginPath();
    ctx.moveTo(120, 165);
    ctx.lineTo(960, 165);
    ctx.lineWidth = 2;
    ctx.stroke();

    const isQuestion = typeSelect.value === "question";
    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = '700 36px "Courier New", monospace';
    ctx.fillText(isQuestion ? "ANONYMOUS QUESTION" : "ANONYMOUS DOODLE", canvas.width / 2, 242);

    if (isQuestion) {
      ctx.fillStyle = palette.paper;
      ctx.fillRect(138, 315, 804, 565);
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(138, 315, 804, 565);
      const message = questionInput.value.trim();
      if (message) {
        drawWrapped(message, canvas.width / 2, 597, 700, 54, 7, 72);
      } else {
        ctx.fillStyle = palette.mid;
        ctx.font = '24px "Courier New", monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("YOUR QUESTION WILL LIVE HERE", canvas.width / 2, 597);
      }
    } else {
      drawDoodle();
      const note = noteInput.value.trim();
      if (note) drawWrapped(note, canvas.width / 2, 900, 800, 28, 2, 36);
    }

    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    ctx.moveTo(120, 1000);
    ctx.lineTo(960, 1000);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = '700 27px "Courier New", monospace';
    ctx.textBaseline = "middle";
    ctx.fillText("thank you!!", 120, 1075);
    ctx.textAlign = "right";
    ctx.font = '64px "Noto Sans Sinhala", "Arial Unicode MS", sans-serif';
    ctx.fillText("ඞ", 960, 1075);
  }

  function syncType() {
    const isQuestion = typeSelect.value === "question";
    questionFields.hidden = !isQuestion;
    doodleFields.hidden = isQuestion;
    render();
    setStatus(isQuestion ? "Paste a question to make its card." : "Choose a doodle PNG to make its card.");
  }

  function clearFields() {
    questionInput.value = "";
    noteInput.value = "";
    doodleInput.value = "";
    typeSelect.value = "question";
    questionFields.hidden = false;
    doodleFields.hidden = true;
    hasDoodle = false;
    if (doodleObjectUrl) {
      URL.revokeObjectURL(doodleObjectUrl);
      doodleObjectUrl = null;
    }
    render();
  }

  function saveBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sankaa-velt-anonymous-${typeSelect.value}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  typeSelect.addEventListener("change", syncType);
  questionInput.addEventListener("input", render);
  noteInput.addEventListener("input", render);
  doodleInput.addEventListener("change", () => {
    const file = doodleInput.files && doodleInput.files[0];
    if (!file) {
      hasDoodle = false;
      render();
      return;
    }
    if (file.type !== "image/png") {
      doodleInput.value = "";
      hasDoodle = false;
      render();
      setStatus("Please choose a PNG image.");
      return;
    }
    if (doodleObjectUrl) URL.revokeObjectURL(doodleObjectUrl);
    doodleObjectUrl = URL.createObjectURL(file);
    image.onload = () => {
      hasDoodle = true;
      render();
      setStatus("Doodle loaded. Download the card when it looks right.");
    };
    image.onerror = () => {
      hasDoodle = false;
      render();
      setStatus("That image could not be opened. Please choose another PNG.");
    };
    image.src = doodleObjectUrl;
  });

  downloadButton.addEventListener("click", () => {
    if (typeSelect.value === "question" && !questionInput.value.trim()) {
      setStatus("Paste a question before downloading the card.");
      questionInput.focus();
      return;
    }
    if (typeSelect.value === "doodle" && !hasDoodle) {
      setStatus("Choose a doodle PNG before downloading the card.");
      doodleInput.focus();
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("The card could not be created. Please try again.");
        return;
      }
      saveBlob(blob);
      clearFields();
      setStatus("Card downloaded. The fields are cleared and ready for the next one.");
    }, "image/png");
  });

  if (navigator.canShare && navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async () => {
      if (typeSelect.value === "question" && !questionInput.value.trim()) {
        setStatus("Paste a question before sharing the card.");
        return;
      }
      if (typeSelect.value === "doodle" && !hasDoodle) {
        setStatus("Choose a doodle PNG before sharing the card.");
        return;
      }
      canvas.toBlob(async (blob) => {
        if (!blob) return setStatus("The card could not be created. Please try again.");
        const file = new File([blob], `sankaa-velt-anonymous-${typeSelect.value}.png`, { type: "image/png" });
        try {
          if (!navigator.canShare({ files: [file] })) return setStatus("Sharing images is not supported here. Download the PNG instead.");
          await navigator.share({ files: [file], title: "Anonymous inbox card" });
          clearFields();
          setStatus("Card shared. The fields are cleared and ready for the next one.");
        } catch (error) {
          if (error.name !== "AbortError") setStatus("Could not open sharing. Download the PNG instead.");
        }
      }, "image/png");
    });
  }

  render();
})();
