// قائمة حفظ كائنات الطلاب
const studentsList = [];

// كلاس الطالب مع حماية البيانات باستخدام Private Fields
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // الاسم
  set name(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("من فضلك أدخل اسم الطالب.");
    }
    this.#name = value.trim();
  }

  get name() {
    return this.#name;
  }

  // التحقق من الدرجات ونسبة الحضور
  validateNumber(value, fieldName) {
    if (value === "" || value === null || value === undefined) {
      throw new Error(`حقل ${fieldName} مطلوب ولا يمكن تركه فارغًا.`);
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(`من فضلك أدخل رقمًا صحيحًا في حقل ${fieldName}.`);
    }

    if (numberValue < 0 || numberValue > 100) {
      throw new Error(`${fieldName} يجب أن تكون بين 0 و100.`);
    }

    return numberValue;
  }

  set grade1(value) {
    this.#grade1 = this.validateNumber(value, "درجة المادة الأولى");
  }
  get grade1() {
    return this.#grade1;
  }

  set grade2(value) {
    this.#grade2 = this.validateNumber(value, "درجة المادة الثانية");
  }
  get grade2() {
    return this.#grade2;
  }

  set grade3(value) {
    this.#grade3 = this.validateNumber(value, "درجة المادة الثالثة");
  }
  get grade3() {
    return this.#grade3;
  }

  set attendance(value) {
    this.#attendance = this.validateNumber(value, "نسبة الحضور");
  }
  get attendance() {
    return this.#attendance;
  }

  getAverage() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

// الإمساك بعناصر الصفحة باستخدام DOM
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const studentsListDisplay = document.getElementById("studentsListDisplay");
const studentsCount = document.getElementById("studentsCount");
const graceBtn = document.getElementById("graceBtn");
const reportBox = document.getElementById("reportBox");

// إضافة طالب جديد
studentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  errorBox.textContent = "";
  errorBox.classList.add("d-none");

  try {
    const student = new Student(
      studentNameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();
    studentForm.reset();
    reportBox.innerHTML = '<p class="empty-state mb-0">تم تحديث قائمة الطلاب. فعّل اللجنة لإنشاء تقرير جديد.</p>';
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("d-none");
  }
});

// عرض قائمة الطلاب على الشاشة
function renderStudents() {
  studentsCount.textContent = `${studentsList.length} طالب`;

  if (studentsList.length === 0) {
    studentsListDisplay.innerHTML = '<p class="empty-state mb-0">لم تتم إضافة طلاب حتى الآن.</p>';
    return;
  }

  studentsListDisplay.innerHTML = studentsList.map((student, index) => `
    <div class="student-item">
      <div>
        <div class="student-name">${escapeHTML(student.name)}</div>
        <div class="student-meta">الطالب رقم ${index + 1} · الحضور: ${student.attendance}%</div>
      </div>
      <div class="student-meta">المتوسط: ${student.getAverage().toFixed(2)}%</div>
    </div>
  `).join("");
}

// حماية النصوص التي تُعرض داخل HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

// لجنة الرأفة: Filter ثم Map ثم Reduce
graceBtn.addEventListener("click", function () {
  const strugglingStudents = studentsList.filter(function (student) {
    const average = student.getAverage();
    return average >= 40 && average <= 49;
  });

  if (strugglingStudents.length === 0) {
    reportBox.innerHTML = `
      <p class="empty-state mb-0">
        لا يوجد طلاب متوسط درجاتهم بين 40 و49 حاليًا.
      </p>
    `;
    return;
  }

  const studentsAfterGrace = strugglingStudents.map(function (student) {
    return {
      name: student.name,
      oldAverage: student.getAverage(),
      newAverage: student.getAverage() + 5
    };
  });

  const totalAfterGrace = studentsAfterGrace.reduce(function (total, student) {
    return total + student.newAverage;
  }, 0);

  const generalAverage = totalAfterGrace / studentsAfterGrace.length;

  const studentsHTML = studentsAfterGrace.map(function (student) {
    return `
      <div class="report-student">
        <span>${escapeHTML(student.name)} <small class="text-secondary">(قبل الرأفة: ${student.oldAverage.toFixed(2)})</small></span>
        <span class="after-grade">${student.newAverage.toFixed(2)} بعد الرأفة</span>
      </div>
    `;
  }).join("");

  reportBox.innerHTML = `
    <div class="report-summary">
      <span class="summary-chip">عدد الطلاب المتعثرين: ${studentsAfterGrace.length}</span>
      <span class="summary-chip">المتوسط العام بعد الرأفة: ${generalAverage.toFixed(2)}</span>
    </div>
    <h3 class="h6 fw-bold mt-3">تفاصيل الطلاب</h3>
    ${studentsHTML}
  `;
});
