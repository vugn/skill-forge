import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Time "mo:base/Time";
import AuthTypes "../types/Auth";

module {
  public func principalKey(p: Principal): Trie.Key<Principal> {
    { key = p; hash = Principal.hash(p) }
  };

  public func textKey(t: Text): Trie.Key<Text> {
    { key = t; hash = Text.hash(t) }
  };

  public func hashPassword(password: Text): Text {
    password # "_hashed"
  };

  public func validateEmail(email: Text): Bool {
    Text.contains(email, #char '@') and Text.size(email) > 5
  };

  public func validatePassword(password: Text): Bool {
    Text.size(password) >= 6
  };

  public func validateUsername(username: Text): Bool {
    let size = Text.size(username);
    size >= 3 and size <= 20
  };

  public func isSessionValid(session: AuthTypes.Session): Bool {
    Time.now() < session.expiresAt
  };

  public func createSessionExpiry(): Time.Time {
    Time.now() + (24 * 60 * 60 * 1_000_000_000)
  };
}