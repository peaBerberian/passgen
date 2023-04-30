/** All characters that may be added as "symbols". */
const SYMBOLS = "`~!@#$%^&*()_+[]{}|;':\",./<>?";

const LOWER_CASE_LETTERS = "qwertyuiopasdfghjklzxcvbnm";
const UPPER_CASE_LETTERS = "QWERTYUIOPASDFGHJKLZXCVBNM";

const LOWER_FACTOR = 3;
const UPPER_FACTOR = 3;
const NUM_FACTOR = 2;
const SYMBOLS_FACTOR = 1;

/** All characters that may be added as "numbers". */
const NUMBERS = "1234567890";

const len = document.getElementById("length-input").value;

const copyBtn = document.getElementById("copy-btn");
copyBtn.onclick = function () {
  navigator.clipboard.writeText(output.textContent).then(
    () => {
      copyBtn.style.fill = "#00ff00";
    },
    () => {
      copyBtn.style.fill = "#ff0000";
    }
  );
};
const lowerCaseCheckButton = document.getElementById("lower-case-btn");
const upperCaseCheckButton = document.getElementById("upper-case-btn");
const numberCheckButton = document.getElementById("nums-btn");
const symbolsCheckButton = document.getElementById("symbols-btn");
const lengthInput = document.getElementById("length-input");
const output = document.getElementById("output");

document.getElementById("generate-btn").onclick = generate;

function generate() {
  copyBtn.style.display = "none";
  copyBtn.style.fill = null;
  output.textContent = "";

  const shouldHaveLowerCase = lowerCaseCheckButton.checked;
  const shouldHaveUpperCase = upperCaseCheckButton.checked;
  const shouldHaveNums = numberCheckButton.checked;
  const shouldHaveSymbols = symbolsCheckButton.checked;
  let len = +lengthInput.value;
  try {
    if (isNaN(len) || len === 0) {
      output.textContent = "Error: Invalid length value.";
      return;
    }
    if (len > 1000) {
      output.textContent = "Error: Length too high";
      return;
    }

    const pw = generatePassword();
    output.textContent = pw;
    if (navigator.clipboard != null) {
      copyBtn.style.display = "inline";
    }
  } catch (err) {
    output.textContent = "Error while calculating password: " + err.message;
  }

  /**
   * Generate a password of the length given in argument.
   * @returns {string}
   */
  function generatePassword() {
    const minLen =
      +shouldHaveLowerCase +
      shouldHaveUpperCase +
      shouldHaveNums +
      shouldHaveSymbols;
    if (len < minLen) {
      throw new Error("Password length too short.");
    }
    const lowerLastNb = shouldHaveLowerCase
      ? LOWER_CASE_LETTERS.length * LOWER_FACTOR
      : 0;
    const upperLastNb = shouldHaveUpperCase
      ? lowerLastNb + UPPER_CASE_LETTERS.length * UPPER_FACTOR
      : lowerLastNb;
    const numsLastNb = shouldHaveNums
      ? upperLastNb + NUMBERS.length * NUM_FACTOR
      : upperLastNb;
    const globalLen = shouldHaveSymbols
      ? numsLastNb + SYMBOLS.length * SYMBOLS_FACTOR
      : numsLastNb;
    let pw;
    let iteration = 0;
    while (true) {
      pw = "";
      for (let i = 0; i < len; i++) {
        // Letters have three times more chances to appear
        const randomIdx = Math.floor(Math.random() * globalLen);
        if (randomIdx < lowerLastNb) {
          pw += LOWER_CASE_LETTERS[Math.floor(randomIdx / LOWER_FACTOR)];
        } else if (randomIdx < upperLastNb) {
          pw +=
            UPPER_CASE_LETTERS[
              Math.floor((randomIdx - lowerLastNb) / UPPER_FACTOR)
            ];
        } else if (randomIdx < numsLastNb) {
          pw += NUMBERS[Math.floor((randomIdx - upperLastNb) / NUM_FACTOR)];
        } else {
          pw += SYMBOLS[Math.floor((randomIdx - numsLastNb) / SYMBOLS_FACTOR)];
        }
      }
      if (checkPassword(pw)) {
        return pw;
      }
      if (++iteration > 100) {
        throw new Error("Too many iterations.");
      }
    }
  }

  /**
   * Check that there's at least:
   *   - one lower case letter if `shouldHaveLowerCase` is `true`
   *   - one upper case letter if `shouldHaveUpperCase` is `true`
   *   - one number if `shouldHaveNums` is `true`
   *   - one symbol if `shouldHaveSymbols` is `true`
   *
   * And return `true` if that's the case.
   * Returns `false` otherwise.
   * @param {string} pw
   * @returns {boolean}
   */
  function checkPassword(pw) {
    let hasLowerCase = false;
    let hasUpperCase = false;
    let hasNumber = false;
    let hasSymbol = false;
    for (let i = 0; i < pw.length; i++) {
      const charCode = pw.charCodeAt(i);
      if (charCode >= 48 /* 0 */) {
        if (charCode <= 57 /* 9 */) {
          hasNumber = true;
        } else if (charCode >= 65 /* A */) {
          if (charCode <= 90 /* Z */) {
            hasUpperCase = true;
          } else if (charCode >= 97 /* a */ && charCode <= 122 /* z */) {
            hasLowerCase = true;
          } else {
            hasSymbol = true;
          }
        } else {
          hasSymbol = true;
        }
      } else {
        hasSymbol = true;
      }
    }
    if (!hasNumber && shouldHaveNums) {
      return false;
    }
    if (!hasSymbol && shouldHaveSymbols) {
      return false;
    }
    if (!hasLowerCase && shouldHaveLowerCase) {
      return false;
    }
    if (!hasUpperCase && shouldHaveUpperCase) {
      return false;
    }
    return true;
  }
}
