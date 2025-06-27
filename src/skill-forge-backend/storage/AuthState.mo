import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import AuthTypes "../types/Auth";

module {
  public type AuthState = {
    var users: Trie.Trie<Principal, AuthTypes.User>;
    var usersByEmail: Trie.Trie<Text, Principal>;
    var sessions: Trie.Trie<Principal, AuthTypes.Session>;
    var settings: Trie.Trie<Principal, AuthTypes.Settings>; // NEW
  };

  public func initAuthState(): AuthState {
    {
      var users = Trie.empty<Principal, AuthTypes.User>();
      var usersByEmail = Trie.empty<Text, Principal>();
      var sessions = Trie.empty<Principal, AuthTypes.Session>();
      var settings = Trie.empty<Principal, AuthTypes.Settings>(); // NEW
    }
  };

  // NEW: Default settings
  public func getDefaultSettings(): AuthTypes.Settings {
    {
      theme = "light";
      language = "en";
      notification = true;
    }
  };
}