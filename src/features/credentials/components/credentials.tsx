"use client";

import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { KeyIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CredentialDialog } from "./credential-dialog";
import { CredentialType } from "@prisma/client";

type CredentialListItem = {
  id: string;
  name: string;
  type: CredentialType;
  createdAt: Date;
  updatedAt: Date;
};

const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  OPENAI: "OpenAI",
  GOOGLE: "Google / Gemini",
  ANTHROPIC: "Anthropic",
  DISCORD: "Discord",
  SLACK: "Slack",
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();
  return (
    <EntityList
      items={credentials.data.items}
      getKey={(cred) => cred.id}
      renderItem={(cred) => <CredentialItem data={cred} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <CredentialDialog
        mode="create"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <EntityHeader
        title="Credentials"
        description="Manage your API keys for AI providers"
        onNew={() => setDialogOpen(true)}
        newButtonLabel="New credential"
        disabled={disabled}
      />
    </>
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading credentials" />;
};

export const CredentialsEmpty = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <CredentialDialog
        mode="create"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <EmptyView
        onNew={() => setDialogOpen(true)}
        message="You haven't added any credentials yet. Add your first API key to get started."
      />
    </>
  );
};

export const CredentialItem = ({ data }: { data: CredentialListItem }) => {
  const removeCredential = useRemoveCredential();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isRemoving =
    removeCredential.isPending &&
    removeCredential.variables?.id === data.id;

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  return (
    <>
      <CredentialDialog
        mode="edit"
        credentialId={data.id}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        defaultValues={{ name: data.name, type: data.type }}
      />
      <EntityItem
        onClick={() => setEditDialogOpen(true)}
        title={data.name}
        subtitle={
          <>
            {CREDENTIAL_TYPE_LABELS[data.type]} &bull; Updated{" "}
            {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
          </>
        }
        image={
          <div className="size-8 flex items-center justify-center">
            <KeyIcon className="size-5 text-muted-foreground" />
          </div>
        }
        onRemove={handleRemove}
        isRemoving={isRemoving}
      />
    </>
  );
};
