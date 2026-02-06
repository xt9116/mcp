/**
 * Test script to validate Open.browserOn() validation rules
 */

import { validateSerenityWebClass } from './build/validators/serenity-web.validator.js';

console.log('🧪 Testing Open.browserOn() Validation Rules\n');
console.log('=' .repeat(80));

// Test 1: Valid Task with Open.browserOn - SHOULD PASS
console.log('\n\n✅ Test 1: Valid Task with Open.browserOn and private UI field');
console.log('-'.repeat(80));
const validTaskCode = `package com.test.tasks;

import com.test.userinterfaces.UILoginPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Open;

public class AbrirLogin implements Task {
    private UILoginPage uiLoginPage;

    public AbrirLogin() {
        // Constructor público requerido por ByteBuddy
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(uiLoginPage)
        );
    }

    public static AbrirLogin enPagina() {
        return Tasks.instrumented(AbrirLogin.class);
    }
}`;

const result1 = validateSerenityWebClass('Task', validTaskCode, 'AbrirLogin');
console.log('Result:', result1.summary);
console.log('Errors:', result1.errors.length);
console.log('Warnings:', result1.warnings.length);
if (result1.errors.length > 0) {
    console.log('\nErrors found:');
    result1.errors.forEach(e => console.log('  -', e));
}
if (result1.warnings.length > 0) {
    console.log('\nWarnings found:');
    result1.warnings.forEach(w => console.log('  -', w));
}

// Test 2: Invalid Task - Uses Open.browserOn but NO private field - SHOULD FAIL
console.log('\n\n❌ Test 2: Invalid Task - Open.browserOn without private UI field');
console.log('-'.repeat(80));
const invalidTaskCode = `package com.test.tasks;

import com.test.userinterfaces.UILoginPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Open;

public class AbrirLogin implements Task {
    public UILoginPage uiLoginPage;  // WRONG: Should be private

    public AbrirLogin() {
        // Constructor público
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(uiLoginPage)
        );
    }

    public static AbrirLogin enPagina() {
        return Tasks.instrumented(AbrirLogin.class);
    }
}`;

const result2 = validateSerenityWebClass('Task', invalidTaskCode, 'AbrirLogin');
console.log('Result:', result2.summary);
console.log('Errors:', result2.errors.length);
console.log('Warnings:', result2.warnings.length);
if (result2.errors.length > 0) {
    console.log('\nErrors found:');
    result2.errors.forEach(e => console.log('  -', e));
}
if (result2.warnings.length > 0) {
    console.log('\nWarnings found:');
    result2.warnings.forEach(w => console.log('  -', w));
}

// Test 3: Invalid Task - Uses Open.browserOn but no UI field at all - SHOULD FAIL
console.log('\n\n❌ Test 3: Invalid Task - Open.browserOn without any UI field');
console.log('-'.repeat(80));
const invalidTaskCode2 = `package com.test.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Open;

public class AbrirLogin implements Task {

    public AbrirLogin() {
        // Constructor público
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(new UILoginPage())  // WRONG: Should use private field
        );
    }

    public static AbrirLogin enPagina() {
        return Tasks.instrumented(AbrirLogin.class);
    }
}`;

const result3 = validateSerenityWebClass('Task', invalidTaskCode2, 'AbrirLogin');
console.log('Result:', result3.summary);
console.log('Errors:', result3.errors.length);
console.log('Warnings:', result3.warnings.length);
if (result3.errors.length > 0) {
    console.log('\nErrors found:');
    result3.errors.forEach(e => console.log('  -', e));
}
if (result3.warnings.length > 0) {
    console.log('\nWarnings found:');
    result3.warnings.forEach(w => console.log('  -', w));
}

// Test 4: Valid UI Class with @DefaultUrl and extends PageObject - SHOULD PASS
console.log('\n\n✅ Test 4: Valid UI Class with @DefaultUrl and extends PageObject');
console.log('-'.repeat(80));
const validUICode = `package com.test.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://www.saucedemo.com/")
public class UILoginPage extends PageObject {
    public static final Target TXT_USERNAME = Target.the("Username field")
        .locatedBy("#user-name");
    
    public static final Target TXT_PASSWORD = Target.the("Password field")
        .locatedBy("#password");
    
    public static final Target BTN_LOGIN = Target.the("Login button")
        .locatedBy("#login-button");
}`;

const result4 = validateSerenityWebClass('UI', validUICode, 'UILoginPage');
console.log('Result:', result4.summary);
console.log('Errors:', result4.errors.length);
console.log('Warnings:', result4.warnings.length);
if (result4.errors.length > 0) {
    console.log('\nErrors found:');
    result4.errors.forEach(e => console.log('  -', e));
}
if (result4.warnings.length > 0) {
    console.log('\nWarnings found:');
    result4.warnings.forEach(w => console.log('  -', w));
}

// Test 5: Invalid UI Class - Missing @DefaultUrl - SHOULD FAIL
console.log('\n\n❌ Test 5: Invalid UI Class - Missing @DefaultUrl annotation');
console.log('-'.repeat(80));
const invalidUICode = `package com.test.userinterfaces;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class UILoginPage extends PageObject {
    public static final Target TXT_USERNAME = Target.the("Username field")
        .locatedBy("#user-name");
}`;

const result5 = validateSerenityWebClass('UI', invalidUICode, 'UILoginPage');
console.log('Result:', result5.summary);
console.log('Errors:', result5.errors.length);
console.log('Warnings:', result5.warnings.length);
if (result5.errors.length > 0) {
    console.log('\nErrors found:');
    result5.errors.forEach(e => console.log('  -', e));
}
if (result5.warnings.length > 0) {
    console.log('\nWarnings found:');
    result5.warnings.forEach(w => console.log('  -', w));
}

// Test 6: Invalid UI Class - Does not extend PageObject - SHOULD FAIL
console.log('\n\n❌ Test 6: Invalid UI Class - Does not extend PageObject');
console.log('-'.repeat(80));
const invalidUICode2 = `package com.test.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://www.saucedemo.com/")
public class UILoginPage {
    public static final Target TXT_USERNAME = Target.the("Username field")
        .locatedBy("#user-name");
}`;

const result6 = validateSerenityWebClass('UI', invalidUICode2, 'UILoginPage');
console.log('Result:', result6.summary);
console.log('Errors:', result6.errors.length);
console.log('Warnings:', result6.warnings.length);
if (result6.errors.length > 0) {
    console.log('\nErrors found:');
    result6.errors.forEach(e => console.log('  -', e));
}
if (result6.warnings.length > 0) {
    console.log('\nWarnings found:');
    result6.warnings.forEach(w => console.log('  -', w));
}

// Summary
console.log('\n\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(80));

const testResults = [
    { name: 'Test 1: Valid Task with Open.browserOn', passed: result1.isValid, expectedPass: true },
    { name: 'Test 2: Invalid Task (public field)', passed: result2.isValid, expectedPass: false },
    { name: 'Test 3: Invalid Task (no field)', passed: result3.isValid, expectedPass: false },
    { name: 'Test 4: Valid UI Class', passed: result4.isValid, expectedPass: true },
    { name: 'Test 5: Invalid UI (no @DefaultUrl)', passed: result5.isValid, expectedPass: false },
    { name: 'Test 6: Invalid UI (no extends)', passed: result6.isValid, expectedPass: false }
];

let allPassed = true;
testResults.forEach(test => {
    const correct = test.passed === test.expectedPass;
    const icon = correct ? '✅' : '❌';
    const status = test.expectedPass ? (test.passed ? 'PASS' : 'FAIL') : (test.passed ? 'FAIL' : 'PASS');
    console.log(`${icon} ${test.name}: ${status}`);
    if (!correct) allPassed = false;
});

console.log('\n' + '='.repeat(80));
console.log(allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!');
console.log('='.repeat(80));

process.exit(allPassed ? 0 : 1);
