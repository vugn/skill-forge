import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Text "mo:base/Text";
import AuthTypes "../types/Auth";
import AuthState "../storage/AuthState";
import AuthHelpers "../utils/AuthHelpers";

module {
  public func register(
    authState: AuthState.AuthState,
    caller: Principal,
    request: AuthTypes.RegisterRequest
  ): AuthTypes.AuthResult<AuthTypes.User> {
    
    // Validasi input
    if (not AuthHelpers.validateUsername(request.username)) {
      return #err("Invalid username. Must be 3-20 characters.")
    };
    
    if (not AuthHelpers.validateEmail(request.email)) {
      return #err("Invalid email format.")
    };
    
    if (not AuthHelpers.validatePassword(request.password)) {
      return #err("Password must be at least 6 characters.")
    };

    // Cek apakah user sudah ada
    switch (Trie.get(authState.users, AuthHelpers.principalKey(caller), Principal.equal)) {
      case (?_) { return #err("User already registered.") };
      case null {};
    };

    // Cek apakah email sudah digunakan
    switch (Trie.get(authState.usersByEmail, AuthHelpers.textKey(request.email), Text.equal)) {
      case (?_) { return #err("Email already in use.") };
      case null {};
    };

    // Buat user baru dengan traditional auth
    let hashedPassword = AuthHelpers.hashPassword(request.password);
    let newUser: AuthTypes.User = {
      id = caller;
      username = request.username;
      email = request.email;
      hashedPassword = ?hashedPassword;  // Optional untuk II users
      authMethod = #EmailPassword;
      createdAt = Time.now();
    };

    // Simpan user
    let (newUsers, _) = Trie.put(
      authState.users,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      newUser
    );
    authState.users := newUsers;

    // Simpan mapping email ke principal
    let (newEmailMap, _) = Trie.put(
      authState.usersByEmail,
      AuthHelpers.textKey(request.email),
      Text.equal,
      caller
    );
    authState.usersByEmail := newEmailMap;

    // Create default settings for new user
    let defaultSettings = AuthState.getDefaultSettings();
    let (newSettings, _) = Trie.put(
      authState.settings,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      defaultSettings
    );
    authState.settings := newSettings;

    #ok(newUser)
  };

  // NEW: Create user from Internet Identity
  public func createUserFromII(
    authState: AuthState.AuthState,
    caller: Principal,
    username: Text,
    email: Text
  ): AuthTypes.AuthResult<AuthTypes.User> {
    
    // Validasi input
    if (not AuthHelpers.validateUsername(username)) {
      return #err("Invalid username. Must be 3-20 characters.")
    };
    
    if (not AuthHelpers.validateEmail(email)) {
      return #err("Invalid email format.")
    };

    // Cek apakah user sudah ada
    switch (Trie.get(authState.users, AuthHelpers.principalKey(caller), Principal.equal)) {
      case (?_) { return #err("User already registered.") };
      case null {};
    };

    // Cek apakah email sudah digunakan
    switch (Trie.get(authState.usersByEmail, AuthHelpers.textKey(email), Text.equal)) {
      case (?_) { return #err("Email already in use.") };
      case null {};
    };

    // Buat user baru dengan Internet Identity
    let newUser: AuthTypes.User = {
      id = caller;
      username = username;
      email = email;
      hashedPassword = null;  // No password untuk II users
      authMethod = #InternetIdentity;
      createdAt = Time.now();
    };

    // Simpan user
    let (newUsers, _) = Trie.put(
      authState.users,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      newUser
    );
    authState.users := newUsers;

    // Simpan mapping email ke principal
    let (newEmailMap, _) = Trie.put(
      authState.usersByEmail,
      AuthHelpers.textKey(email),
      Text.equal,
      caller
    );
    authState.usersByEmail := newEmailMap;

    // Create session for II user
    let session: AuthTypes.Session = {
      userId = caller;
      expiresAt = AuthHelpers.createSessionExpiry();
    };

    let (newSessions, _) = Trie.put(
      authState.sessions,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      session
    );
    authState.sessions := newSessions;

    // Create default settings
    let defaultSettings = AuthState.getDefaultSettings();
    let (newSettings, _) = Trie.put(
      authState.settings,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      defaultSettings
    );
    authState.settings := newSettings;

    #ok(newUser)
  };

  // NEW: Create session for II users
  public func createSession(
    authState: AuthState.AuthState,
    caller: Principal
  ): Bool {
    let session: AuthTypes.Session = {
      userId = caller;
      expiresAt = AuthHelpers.createSessionExpiry();
    };

    let (newSessions, _) = Trie.put(
      authState.sessions,
      AuthHelpers.principalKey(caller),
      Principal.equal,
      session
    );
    authState.sessions := newSessions;
    true
  };

  public func login(
    authState: AuthState.AuthState,
    request: AuthTypes.LoginRequest
  ): AuthTypes.AuthResult<AuthTypes.User> {
    
    // Cari user berdasarkan email
    switch (Trie.get(authState.usersByEmail, AuthHelpers.textKey(request.email), Text.equal)) {
      case null { return #err("Invalid email or password.") };
      case (?userId) {
        switch (Trie.get(authState.users, AuthHelpers.principalKey(userId), Principal.equal)) {
          case null { return #err("User not found.") };
          case (?user) {
            // Check if user uses email/password auth
            switch (user.authMethod) {
              case (#InternetIdentity) {
                return #err("This account uses Internet Identity. Please login with II.")
              };
              case (#EmailPassword) {
                // Verifikasi password
                switch (user.hashedPassword) {
                  case null { return #err("Password not set for this account.") };
                  case (?storedHash) {
                    let hashedInputPassword = AuthHelpers.hashPassword(request.password);
                    if (hashedInputPassword != storedHash) {
                      return #err("Invalid email or password.")
                    };

                    // Buat session
                    let session: AuthTypes.Session = {
                      userId = userId;
                      expiresAt = AuthHelpers.createSessionExpiry();
                    };

                    let (newSessions, _) = Trie.put(
                      authState.sessions,
                      AuthHelpers.principalKey(userId),
                      Principal.equal,
                      session
                    );
                    authState.sessions := newSessions;

                    #ok(user)
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  public func logout(
    authState: AuthState.AuthState,
    caller: Principal
  ): Bool {
    let (newSessions, existed) = Trie.remove(
      authState.sessions,
      AuthHelpers.principalKey(caller),
      Principal.equal
    );
    authState.sessions := newSessions;
    Option.isSome(existed)
  };

  public func getCurrentUser(
    authState: AuthState.AuthState,
    caller: Principal
  ): ?AuthTypes.User {
    // Cek session terlebih dahulu
    switch (Trie.get(authState.sessions, AuthHelpers.principalKey(caller), Principal.equal)) {
      case null { null };
      case (?session) {
        if (not AuthHelpers.isSessionValid(session)) {
          // Session expired, hapus
          let (newSessions, _) = Trie.remove(
            authState.sessions,
            AuthHelpers.principalKey(caller),
            Principal.equal
          );
          authState.sessions := newSessions;
          null
        } else {
          Trie.get(authState.users, AuthHelpers.principalKey(caller), Principal.equal)
        }
      };
    };
  };

  // Settings Functions
  public func getSettings(
    authState: AuthState.AuthState,
    caller: Principal
  ): ?AuthTypes.Settings {
    
    // Check if user is logged in
    switch (getCurrentUser(authState, caller)) {
      case null { null };
      case (?_user) {
        switch (Trie.get(authState.settings, AuthHelpers.principalKey(caller), Principal.equal)) {
          case null {
            // Create default settings
            let defaultSettings = AuthState.getDefaultSettings();
            let (newSettings, _) = Trie.put(
              authState.settings,
              AuthHelpers.principalKey(caller),
              Principal.equal,
              defaultSettings
            );
            authState.settings := newSettings;
            ?defaultSettings
          };
          case (?settings) { ?settings };
        };
      };
    };
  };

  public func updateSettings(
    authState: AuthState.AuthState,
    caller: Principal,
    newSettings: AuthTypes.Settings
  ): Bool {
    
    // Check if user is logged in
    switch (getCurrentUser(authState, caller)) {
      case null { false };
      case (?_user) {
        let (updatedSettings, _) = Trie.put(
          authState.settings,
          AuthHelpers.principalKey(caller),
          Principal.equal,
          newSettings
        );
        authState.settings := updatedSettings;
        true
      };
    };
  };
}