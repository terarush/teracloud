import { tl } from "@/lib/i18n"

export const authContent = {
  get login() {
    return {
      get title() { return tl("auth.login.title") },
      get subtitle() { return tl("auth.login.subtitle") },
      get emailLabel() { return tl("auth.login.emailLabel") },
      get emailPlaceholder() { return tl("auth.login.emailPlaceholder") },
      get passwordLabel() { return tl("auth.login.passwordLabel") },
      get passwordPlaceholder() { return tl("auth.login.passwordPlaceholder") },
      get rememberMe() { return tl("auth.login.rememberMe") },
      get forgotPassword() { return tl("auth.login.forgotPassword") },
      get submitButton() { return tl("auth.login.submitButton") },
      get submittingButton() { return tl("auth.login.submittingButton") },
      get noAccountText() { return tl("auth.login.noAccountText") },
      get signUpLink() { return tl("auth.login.signUpLink") },
      get or() { return tl("auth.login.or") },
      get googleButton() { return tl("auth.login.googleButton") },
    }
  },
  get register() {
    return {
      get title() { return tl("auth.register.title") },
      get subtitle() { return tl("auth.register.subtitle") },
      get firstNameLabel() { return tl("auth.register.firstNameLabel") },
      get firstNamePlaceholder() { return tl("auth.register.firstNamePlaceholder") },
      get lastNameLabel() { return tl("auth.register.lastNameLabel") },
      get lastNamePlaceholder() { return tl("auth.register.lastNamePlaceholder") },
      get emailLabel() { return tl("auth.register.emailLabel") },
      get emailPlaceholder() { return tl("auth.register.emailPlaceholder") },
      get passwordLabel() { return tl("auth.register.passwordLabel") },
      get passwordPlaceholder() { return tl("auth.register.passwordPlaceholder") },
      get confirmPasswordLabel() { return tl("auth.register.confirmPasswordLabel") },
      get confirmPasswordPlaceholder() { return tl("auth.register.confirmPasswordPlaceholder") },
      get usernameLabel() { return tl("auth.register.usernameLabel") },
      get usernamePlaceholder() { return tl("auth.register.usernamePlaceholder") },
      get termsText() { return tl("auth.register.termsText") },
      get termsLink() { return tl("auth.register.termsLink") },
      get andText() { return tl("auth.register.andText") },
      get privacyLink() { return tl("auth.register.privacyLink") },
      get submitButton() { return tl("auth.register.submitButton") },
      get submittingButton() { return tl("auth.register.submittingButton") },
      get hasAccountText() { return tl("auth.register.hasAccountText") },
      get signInLink() { return tl("auth.register.signInLink") },
      get step2Title() { return tl("auth.register.step2Title") },
      get step2Subtitle() { return tl("auth.register.step2Subtitle") },
      get step3Title() { return tl("auth.register.step3Title") },
      get step3Subtitle() { return tl("auth.register.step3Subtitle") },
      get googleButton() { return tl("auth.register.googleButton") },
      get divider() { return tl("auth.register.divider") },
      get continueText() { return tl("auth.register.continue") },
      get back() { return tl("auth.register.back") },
      get stepIndicatorLabel() { return tl("auth.register.stepIndicatorLabel") },
      get checking() { return tl("auth.register.checking") },
      get emailAvailable() { return tl("auth.register.emailAvailable") },
      get emailTaken() { return tl("auth.register.emailTaken") },
      get usernameTakenTryAnother() { return tl("auth.register.usernameTakenTryAnother") },
      get waitingForCheck() { return tl("auth.register.waitingForCheck") },
      get usernameAvailable() { return tl("auth.register.usernameAvailable") },
      get usernameTaken() { return tl("auth.register.usernameTaken") },
      get tryOneOf() { return tl("auth.register.tryOneOf") },
      get usernameHint() { return tl("auth.register.usernameHint") },
      get usernamePlaceholderShort() { return tl("auth.register.usernamePlaceholderShort") },
      get passwordStrength() { return tl("auth.register.passwordStrength") },
      get passwordMatch() { return tl("auth.register.passwordMatch") },
      get createAccount() { return tl("auth.register.createAccount") },
      get strength() {
        return {
          get weak() { return tl("auth.register.strength.weak") },
          get fair() { return tl("auth.register.strength.fair") },
          get good() { return tl("auth.register.strength.good") },
          get strong() { return tl("auth.register.strength.strong") },
        }
      },
    }
  },
  get googleCallback() {
    return {
      get loading() { return tl("auth.googleCallback.loading") },
      noTokenRedirect: "/login",
    }
  },
  get setUsername() {
    return {
      get title() { return tl("auth.setUsername.title") },
      get subtitle() { return tl("auth.setUsername.subtitle") },
      get usernameLabel() { return tl("auth.setUsername.usernameLabel") },
      get usernamePlaceholder() { return tl("auth.setUsername.usernamePlaceholder") },
      get checking() { return tl("auth.setUsername.checking") },
      get available() { return tl("auth.setUsername.available") },
      get taken() { return tl("auth.setUsername.taken") },
      get submitButton() { return tl("auth.setUsername.submitButton") },
      get loadingProfile() { return tl("auth.setUsername.loadingProfile") },
      maxLength: 20,
    }
  },
  get forgotPassword() {
    return {
      get title() { return tl("auth.forgotPassword.title") },
      get submitButton() { return tl("auth.forgotPassword.submitButton") },
      get submittingButton() { return tl("auth.forgotPassword.submittingButton") },
      get sentTitle() { return tl("auth.forgotPassword.sentTitle") },
      get sentEmailBody() { return tl("auth.forgotPassword.sentEmailBody") },
      get backToLogin() { return tl("auth.forgotPassword.backToLogin") },
      get sendFailed() { return tl("auth.forgotPassword.sendFailed") },
    }
  },
  get resetPassword() {
    return {
      get title() { return tl("auth.resetPassword.title") },
      get passwordLabel() { return tl("auth.resetPassword.passwordLabel") },
      get passwordPlaceholder() { return tl("auth.resetPassword.passwordPlaceholder") },
      get confirmPasswordLabel() { return tl("auth.resetPassword.confirmPasswordLabel") },
      get confirmPasswordPlaceholder() { return tl("auth.resetPassword.confirmPasswordPlaceholder") },
      get invalidTitle() { return tl("auth.resetPassword.invalidTitle") },
      get invalidSubtitle() { return tl("auth.resetPassword.invalidSubtitle") },
      get requestNewLink() { return tl("auth.resetPassword.requestNewLink") },
      get successTitle() { return tl("auth.resetPassword.successTitle") },
      get successSubtitle() { return tl("auth.resetPassword.successSubtitle") },
      get goToLogin() { return tl("auth.resetPassword.goToLogin") },
      get description() { return tl("auth.resetPassword.description") },
      get tokenInvalid() { return tl("auth.resetPassword.tokenInvalid") },
      get passwordsDontMatch() { return tl("auth.resetPassword.passwordsDontMatch") },
      get passwordMin() { return tl("auth.resetPassword.passwordMin") },
      get placeholderMin() { return tl("auth.resetPassword.placeholderMin") },
      get resetButton() { return tl("auth.resetPassword.resetButton") },
      get resetting() { return tl("auth.resetPassword.resetting") },
    }
  },
  get backToHome() { return tl("auth.backToHome") },
  get brandPanel() {
    return {
      get headline() { return tl("auth.brandPanel.headline") },
      get subtitle() { return tl("auth.brandPanel.subtitle") },
      get quote() { return tl("auth.brandPanel.quote") },
      get copyright() { return tl("auth.brandPanel.copyright") },
    }
  },
}
