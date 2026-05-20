let assistantCurrentPassword;

export function useAssistant() {
  function setAssistantPassword(password) {
    assistantCurrentPassword = password;
  }

  function getAssistantPassword() {
    return assistantCurrentPassword;
  }

  return {
    getAssistantPassword,
    setAssistantPassword,
  };
}
