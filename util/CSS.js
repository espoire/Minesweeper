const CSS = {
  /** 
   * @returns {CSSRule[]}
   *    All available CSSRules across the entire document.
   */
  getAllCssRules() {
    const ret = [];

    for (const styleSheet of document.styleSheets) {
      for (const rule of styleSheet.cssRules) {
        ret.push(rule);
      }
    }

    return ret;
  },

  /** Removes all CSSRules with the given selectorText (exact match),
   * and then inserts a new rule with the given selectorText and ruleBody.
   * 
   * @param {string} selectorText 
   * @param {string} newRuleBody 
   */
  updateRule(selectorText, newRuleBody) {
    CSS.getAllCssRules().filter((rule) =>
      rule.selectorText === selectorText
    ).forEach((rule) => {
      CSS.removeRule(rule);
    });

    document.styleSheets[0].insertRule(`${selectorText} ${newRuleBody}`);
  },

  /** Removes the given CSSRule from its parent CSSStyleSheet.
   * @param {CSSRule} rule
   */
  removeRule(rule) {
    const sheet = rule.parentStyleSheet;

    for (let i = 0; i < sheet.cssRules.length; i++) {
      if (sheet.cssRules[i] === rule) {
        sheet.deleteRule(i);
        return;
      }
    }
  },
};

export default CSS;