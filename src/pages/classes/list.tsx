import React, {useMemo, useState} from 'react'
import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {ClassDetails, Subject, User} from "@/types";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";
import {useList} from "@refinedev/core";
import {ShowButton} from "@/components/refine-ui/buttons/show.tsx";

const ClassesList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");

    const searchFilters = searchQuery ? [
        {field: "name", operator: "contains" as const, value: searchQuery}
    ] : [];
    const subjectFilters = selectedSubject === "all" ? [] : [
        {field: "subject", operator: "eq" as const, value: selectedSubject}
    ];
    const teacherFilters = selectedTeacher === "all" ? [] : [
        {field: "teacher", operator: "eq" as const, value: selectedTeacher}
    ];

    const classTable = useTable<ClassDetails>({
        columns: useMemo<ColumnDef<ClassDetails>[]>(() => [
            {
                id: "bannerUrl",
                accessorKey: "bannerUrl",
                size: 80,
                header: () => <p className="column-title ml-2">Banner</p>,
                cell: ({getValue}) => {
                    const url = getValue<string | undefined>();
                    return url ? (
                        <img src={url} alt="" className="w-12 h-8 rounded object-cover" />
                    ) : (
                        <div className="w-12 h-8 rounded bg-muted" />
                    );
                }
            },
            {
                id: "name",
                accessorKey: "name",
                header: () => <p className="column-title">Class Name</p>,
                cell: ({getValue}) => <span className="text-foreground font-medium">{getValue<string>()}</span>,
                filterFn: "includesString"
            },
            {
                id: "status",
                accessorKey: "status",
                size: 100,
                header: () => <p className="column-title">Status</p>,
                cell: ({getValue}) => {
                    const status = getValue<string>();
                    const variant = status === "active" ? "default" : "secondary";
                    return <Badge variant={variant} className="capitalize">{status}</Badge>;
                }
            },
            {
                id: "subject",
                accessorKey: "subject.name",
                size: 100,
                header: () => <p className="column-title">Subject</p>,
                cell: ({getValue}) => <Badge variant="secondary">{getValue<string>()}</Badge>
            },
            {
                id: "teacher",
                accessorKey: "teacher.name",
                size: 100,
                header: () => <p className="column-title">Teacher</p>,
                cell: ({getValue}) => <span className="text-foreground">{getValue<string>()}</span>
            },
            {
                id: "capacity",
                accessorKey: "capacity",
                size: 100,
                header: () => <p className="column-title">Capacity</p>,
                cell: ({getValue}) => <span className="text-foreground">{getValue<number>()}</span>
            },
            {
                id: "details",
                size: 140,
                header: () => <p className="column-title">Details</p>,
                cell: ({row}) => <ShowButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            }
        ], []),
        refineCoreProps: {
            resource: "classes",
            pagination: {pageSize: 10, mode: 'server'},
            filters: {
                permanent: [...searchFilters, ...subjectFilters, ...teacherFilters]
            },
            sorters: {
                initial: [
                    {field: "id", order: "desc"}
                ]
            }
        }
    });

    const {query: subjectsQuery} = useList<Subject>({
        resource: "subjects",
        pagination: {pageSize: 100}
    });
    const {query: teachersQuery} = useList<User>({
        resource: "users",
        filters: [{field: 'role', operator: 'eq', value: 'teacher'}],
        pagination: {pageSize: 100}
    });

    const subjects = subjectsQuery?.data?.data || [];
    const teachers = teachersQuery?.data?.data || [];

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Classes</h1>
            <div className="intro-row">
                <p className="whitespace-nowrap">Quick access to essential metrics and management tools.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={selectedSubject}
                            onValueChange={setSelectedSubject}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Subjects
                                </SelectItem>
                                {subjects.map(subject => (
                                    <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedTeacher}
                            onValueChange={setSelectedTeacher}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Teachers
                                </SelectItem>
                                {teachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <CreateButton resource="classes" />
                    </div>
                </div>
            </div>
            <DataTable table={classTable} />
        </ListView>
    )
}
export default ClassesList
