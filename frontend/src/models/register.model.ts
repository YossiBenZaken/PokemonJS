export class RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  referral: string;
  accept_terms: boolean;

  constructor(
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    referral: string,
    accept_terms: boolean
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.password_confirm = password_confirm;
    this.referral = referral;
    this.accept_terms = accept_terms;
  }

  toJSON = () => ({
    username: this.username,
    email: this.email,
    password: this.password,
    password_confirm: this.password_confirm,
    referral: this.referral,
    accept_terms: this.accept_terms,
  });
}
