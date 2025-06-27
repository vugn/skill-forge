import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

module {
  public type User = {
    id: Principal;
    username: Text;
    email: Text;
    hashedPassword: ?Text;    // Optional untuk II users
    authMethod: AuthMethod;   // NEW
    createdAt: Time.Time;
  };

  // NEW: Auth methods
  public type AuthMethod = {
    #InternetIdentity;
    #EmailPassword;
  };

  public type Session = {
    userId: Principal;
    expiresAt: Time.Time;
  };

  public type RegisterRequest = {
    username: Text;
    email: Text;
    password: Text;
  };

  public type LoginRequest = {
    email: Text;
    password: Text;
  };

  public type Settings = {
    theme: Text;
    language: Text;
    notification: Bool;
  };

  public type AuthResult<T> = Result.Result<T, Text>;
}