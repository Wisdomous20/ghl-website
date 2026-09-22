/** Paper-and-graphite concept screens. These are illustrations, never live metrics. */
export function createScreenArt(chapter: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600; canvas.height = 1000;
  const c = canvas.getContext("2d")!;
  const paper = "#e8e3db", ink = "#36332e", pencil = "#756e65", rule = "#b6afa4";
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-detail").trim() || "Arial";
  function text(value: string, x: number, y: number, size = 24, color = ink, weight = 400) {
    c.fillStyle = color; c.font = `${weight} ${size}px ${font}, sans-serif`; c.fillText(value, x, y);
  }
  function line(x: number, y: number, x2: number, y2: number, color = rule, width = 1.5) {
    c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
  }
  function box(x: number, y: number, width: number, height: number) {
    c.fillStyle = paper; c.fillRect(x, y, width, height); c.strokeStyle = rule; c.lineWidth = 1.5; c.strokeRect(x, y, width, height);
  }
  c.fillStyle = paper; c.fillRect(0, 0, 1600, 1000);
  text("enginara / working notes", 70, 80, 27, ink, 600);
  text("ILLUSTRATIVE CONCEPT", 1240, 78, 18, pencil);
  line(70, 117, 1530, 117);

  if (chapter === 2) {
    text("One thing leads to the next.", 80, 244, 60, ink, 500);
    text("A considered path from the first enquiry to a conversation.", 82, 300, 27, pencil);
    const steps = [
      ["01", "An enquiry", "Someone gets in touch."],
      ["02", "A welcome", "The right reply arrives."],
      ["03", "A connection", "Details find their place."],
      ["04", "A conversation", "A time gets booked."],
    ];
    steps.forEach(([number, title, detail], index) => {
      const x = 82 + index * 380;
      box(x, 447, 293, 184);
      text(number, x + 23, 489, 21, pencil);
      text(title, x + 23, 549, 30, ink, 600);
      text(detail, x + 23, 596, 20, pencil);
      if (index < 3) {
        line(x + 293, 541, x + 373, 541, pencil);
        line(x + 365, 535, x + 373, 541, pencil); line(x + 365, 547, x + 373, 541, pencil);
      }
    });
    line(82, 785, 1518, 785);
    text("LESS REPEATING. MORE DOING.", 82, 833, 18, pencil);
    text("Connected tools, with a little more room for your team.", 82, 885, 29);
    text("02 / AUTOMATION", 1290, 926, 17, pencil);
  } else if (chapter === 3) {
    text("A little care goes a long way.", 80, 234, 58, ink, 500);
    text("A shared place to see what is working, and what comes next.", 82, 288, 26, pencil);
    const columns = [82, 700, 1130, 1465];
    ["YOUR SYSTEMS", "LAST CHECKED", "STATUS"].forEach((label, index) => text(label, columns[index], 405, 18, pencil));
    line(82, 428, 1518, 428);
    [
      ["Website & content", "This morning", "Up to date"],
      ["Forms & connections", "This morning", "Working as expected"],
      ["Backups & security", "Scheduled daily", "Taken care of"],
    ].forEach(([name, checked, status], index) => {
      const y = 488 + index * 103;
      text(name, columns[0], y, 29, ink, 500); text(checked, columns[1], y, 24, pencil);
      text(status, columns[2], y, 24); line(82, y + 41, 1518, y + 41);
    });
    text("NEXT, TOGETHER", 82, 837, 18, pencil);
    text("A clearer booking flow. A useful next improvement.", 82, 890, 29);
    text("03 / ONGOING CARE", 1260, 944, 17, pencil);
  } else {
    text("First, an idea.", 85, 360, 108, ink, 500);
    text("Then, we build.", 85, 490, 108, pencil, 500);
    text("A starting point for something useful.", 90, 590, 32, pencil);
    line(85, 780, 1515, 780);
    text("IMAGINE", 85, 845, 20, pencil); text("BUILD", 500, 845, 20, pencil);
    text("CONNECT", 920, 845, 20, pencil); text("CARE", 1445, 845, 20, pencil);
  }
  return canvas;
}
