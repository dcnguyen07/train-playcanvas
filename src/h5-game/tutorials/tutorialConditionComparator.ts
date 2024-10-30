import { GameStorage } from "../../template/systems/storage/gameStorage.js";
import { UIManager } from "../../template/ui/uiManager.js";
import TutorialManager, { ComparisonOperator } from "./tutorialManager.js";

/* eslint-disable default-case */
export class TutorialConditionComparator {
  type: string;

  /**
   * @param {string} type Type for the condition tracker
   */
  constructor(type: string) {
    this.type = type;
  }

  /**
   * @param {import("./tutorialManager.js").TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  checkCondition(condition: any): boolean {
    return false;
  }

}

export class LocalStorageConditionComparator extends TutorialConditionComparator {
  constructor() {
    super("localStorage");
  }

  /**
   * @param {import("./tutorialManager.js").TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  override checkCondition(condition: any): boolean {
    let value = GameStorage.instance.getItem(condition.key);
    if (value === null) {
      return false;
    }
    switch (condition.operator) {
    case ComparisonOperator.EQUAL:
      return value === condition.value;
    case ComparisonOperator.GREATER_THAN:
      return value > condition.value;
    case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      return value >= condition.value;
    case ComparisonOperator.LESS_THAN:
      return value < condition.value;
    case ComparisonOperator.LESS_THAN_OR_EQUAL:
      return value <= condition.value;
    case ComparisonOperator.NOT_EQUAL:
      return value !== condition.value;
    }

    return false;
  }
}

export class CompletedTutorialConditionComparator extends TutorialConditionComparator {
  constructor() {
    super("tutorialCompleted");
  }

  /**
   * @param {import("./tutorialManager.js").TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  override checkCondition(condition: any): boolean {
    return TutorialManager.instance.isTutorialCompleted(condition.key);
  }
}

export class LocalStorageArrayConditionComparator extends TutorialConditionComparator {
  constructor() {
    super("localStorageArray");
  }

  /**
   * @param {import("./tutorialManager.js").TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  override checkCondition(condition: any): boolean {
    let value = GameStorage.instance.getItem(condition.key);
    if (value === null) {
      return false;
    }

    switch (condition.operator) {
    case ComparisonOperator.EQUAL:
      return value.includes(condition.value);
    case ComparisonOperator.NOT_EQUAL:
      return !value.includes(condition.value);
    }

    return false;
  }
}

export class LocalStorageObjectConditionComparator extends TutorialConditionComparator {
  constructor() {
    super("localStorageObject");
  }

  /**
   * @param {import("./tutorialManager.js").TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  override checkCondition(condition: any): boolean {
    let objectString = GameStorage.instance.getItem(condition.key);
    if (objectString === null) {
      return false;
    }

    let objectParsed = JSON.parse(objectString);
    let value = objectParsed.find((item: any) => item.key === condition.objectKey);
    if (value === null) {
      return false;
    }
    let objectAttributeValue = value[condition.objectAttribute];
    switch (condition.operator) {
    case ComparisonOperator.EQUAL:
      return objectAttributeValue === condition.value;
    case ComparisonOperator.GREATER_THAN:
      return objectAttributeValue > condition.value;
    case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      return objectAttributeValue >= condition.value;
    case ComparisonOperator.LESS_THAN:
      return objectAttributeValue < condition.value;
    case ComparisonOperator.LESS_THAN_OR_EQUAL:
      return objectAttributeValue <= condition.value;
    case ComparisonOperator.NOT_EQUAL:
      return objectAttributeValue !== condition.value;
    }

    return false;
  }
}

export class DailyChallengeConditionComparator extends TutorialConditionComparator {
  constructor() {
    super("dailyChallenge");
  }

  override checkCondition(condition: any): boolean {
    let objectString = GameStorage.instance.getItem(condition.storageKey);
    if (objectString === null) {
      return false;
    }
    let objectParsed = JSON.parse(objectString);
    for (let i = 0; i < objectParsed.length; i++) {
      let object = objectParsed[i];
      if (this.checkAttributes(object, condition.objectAttributes, condition.value)) {
        return true;
      }
    }
    return false;
  }

  checkAttributes(object: any, attributes: string[], value: any) {
    for (let i = 0; i < attributes.length; i++) {
      if (object[attributes[i]] !== value) {
        return false;
      }
    }
    return true;
  }
}

export class ActiveScreenConditionComparator extends TutorialConditionComparator {

  _uiManager: UIManager;

  constructor(uiManager: UIManager) {
    super("activeScreen");
    this._uiManager = uiManager;
  }

  override checkCondition(condition: any): boolean {
    let screen = this._uiManager.getScreenByName(condition.layerName, condition.screenName);
    if (!screen) {
      console.warn(`Screen ${condition.screen} not found in layer ${condition.layerName}`);
      return false;
    }
    return screen.enabled === condition.isEnable;
  }
}
