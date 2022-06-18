const CSS = {
  getAllCssRules() {
    const ret = [];

    for (const styleSheet of document.styleSheets) {
      for (const rule of styleSheet.cssRules) {
        ret.push(rule);
      }
    }

    return ret;
  },

  updateRule(selectorText, newRuleBody) {
    CSS.getAllCssRules().filter((rule) =>
      rule.selectorText === selectorText
    ).forEach((rule) => {
      CSS.removeRule(rule);
    });

    document.styleSheets[0].insertRule(`${selectorText} ${newRuleBody}`);
  },

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