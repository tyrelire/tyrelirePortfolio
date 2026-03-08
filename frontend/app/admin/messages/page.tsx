"use client";

import { AdminHero, AdminMain, Notice } from "../_components/AdminLayoutBits";
import { AdminSecurityCard } from "../_components/AdminSecurityCard";
import { MessagesInbox } from "../_components/MessagesInbox";
import { SpinnerScreen } from "../_components/SpinnerScreen";
import { useAdminSession } from "../_hooks/useAdminSession";
import { useAutoRetryLoad } from "../_hooks/useAutoRetryLoad";
import { useMessagesData } from "../_hooks/useMessagesData";
import { BACKEND_RETRY_MS } from "../_lib/constants";

export default function AdminMessagesPage() {
  const session = useAdminSession(true);
  const data = useMessagesData();

  useAutoRetryLoad(
    (options) => {
      if (!session.authenticated) {
        return Promise.resolve(true);
      }

      return data.loadMessages(options);
    },
    BACKEND_RETRY_MS,
    session.authenticated,
  );

  if (session.checking || !session.authenticated) {
    return <SpinnerScreen />;
  }

  return (
    <AdminMain>
      <AdminHero
        title="Messages Inbox"
        description="Read, triage and remove messages sent from the About contact modal."
        actionHref="/admin"
        actionLabel="Back to About Editor"
      />

      <AdminSecurityCard
        pseudo={session.pseudo}
        onLogout={session.logout}
        onChangePassword={session.changePassword}
      />

      <Notice error={data.error} message={data.message} />
      <MessagesInbox
        messages={data.messages}
        selectedId={data.selectedId}
        onSelect={data.setSelectedId}
        selected={data.selectedMessage}
        onRead={data.markAsRead}
        onDelete={data.removeMessage}
      />
    </AdminMain>
  );
}
