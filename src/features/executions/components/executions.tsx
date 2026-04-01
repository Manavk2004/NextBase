"use client";

import {
  useRemoveExecution,
  useSuspenseExecutions,
} from "../hooks/use-executions";
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
import { useExecutionsParams } from "../hooks/use-executions-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ExecutionStatus } from "@prisma/client";

type ExecutionListItem = {
  id: string;
  status: ExecutionStatus;
  trigger: string | null;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  workflow: {
    id: string;
    name: string;
  };
};

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  RUNNING: { icon: Loader2Icon, label: "Running", color: "text-blue-600" },
  SUCCESS: { icon: CheckCircleIcon, label: "Success", color: "text-green-600" },
  ERROR: { icon: XCircleIcon, label: "Failed", color: "text-red-600" },
};

export const ExecutionsSearch = () => {
  const [params, setParams] = useExecutionsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search executions"
    />
  );
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions.data.items}
      getKey={(exec) => exec.id}
      renderItem={(exec) => <ExecutionItem data={exec} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
      newButtonLabel=""
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      search={<ExecutionsSearch />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions yet. Run a workflow to see its execution history here." />
  );
};

export const ExecutionItem = ({ data }: { data: ExecutionListItem }) => {
  const removeExecution = useRemoveExecution();
  const isRemoving =
    removeExecution.isPending &&
    removeExecution.variables?.id === data.id;

  const handleRemove = () => {
    removeExecution.mutate({ id: data.id });
  };

  const config = STATUS_CONFIG[data.status];
  const StatusIcon = config.icon;

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={data.workflow.name}
      subtitle={
        <>
          <span className={config.color}>{config.label}</span>
          {data.trigger && <> &bull; {data.trigger}</>}
          {" "}&bull; Started{" "}
          {formatDistanceToNow(data.startedAt, { addSuffix: true })}
          {data.completedAt && (
            <> &bull; Completed{" "}
              {formatDistanceToNow(data.completedAt, { addSuffix: true })}
            </>
          )}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <StatusIcon
            className={`size-5 ${config.color} ${data.status === "RUNNING" ? "animate-spin" : ""}`}
          />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={isRemoving}
    />
  );
};
