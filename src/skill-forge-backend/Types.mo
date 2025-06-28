import Principal "mo:base/Principal";
import Trie "mo:base/Trie";

module {
    // User profile type
    public type User = {
        id: Principal;
        username: Text;
        fullName: ?Text;
        profilePicture: ?Text;
        createdAt: Int;
        lastLogin: Int;
    };

    // User update data type
    public type UserUpdateData = {
        username: ?Text;
        fullName: ?Text;
        profilePicture: ?Text;
    };

    // User creation data type
    public type UserCreateData = {
        username: Text;
        fullName: ?Text;
        profilePicture: ?Text;
    };

    // Users storage type using Trie
    public type Users = Trie.Trie<Principal, User>;

    // Authentication result type
    public type AuthResult = {
        user: User;
        isNewUser: Bool;
    };

    // Error types
    public type AuthError = {
        #UserNotFound;
        #InvalidPrincipal;
        #UsernameTaken;
        #UsernameInvalid;
        #UpdateFailed;
    };

    // API response types
    public type Result<T, E> = {
        #ok: T;
        #err: E;
    };
}
