"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  studentRegistrationSchema,
  StudentRegistrationForm,
} from "@/lib/validators/studentRegistrationSchema";
import { studentRegistrationService } from "@/services/studentRegistrationService";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { stateDistricts } from "@/lib/stateDistricts";
import { toast } from "sonner";

interface RegistrationFormProps {
  mode?: "create" | "edit";
  defaultValues?: any;
  id?: string;
}

type FormData = StudentRegistrationForm;

function generateAcademicYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const terms = ["SPRING", "SUMMER", "FALL"] as const;
  const years: string[] = [];

  for (let y = currentYear; y <= currentYear + 2; y++) {
    for (const term of terms) {
      years.push(`${term}-${y}`);
    }
  }

  return years;
}

export default function RegistrationForm({
  mode = "create",
  defaultValues,
  id,
}: RegistrationFormProps) {
  const router = useRouter();

  const academicYearOptions = useMemo(() => generateAcademicYearOptions(), []);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentRegistrationForm>({
    resolver: zodResolver(studentRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: mode === "edit" ? defaultValues : undefined,
  });
  // Load student data when editing
  const { data: editStudent, isLoading: editLoading } = useQuery({
    queryKey: ["student-registration", id],
    queryFn: () =>
      studentRegistrationService.getById(id!).then((res) => res.data),
    enabled: mode === "edit" && !!id,
  });

  // state is needed to compute districts
  const stateValue = watch("state");
  const districts = stateDistricts[stateValue] || [];

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (editStudent && mode === "edit") {
      Object.keys(editStudent).forEach((key) => {
        if (editStudent[key] !== undefined) {
          setValue(key as any, editStudent[key]);
        }
      });
    }
  }, [editStudent, mode, setValue]);
  const createMutation = useMutation({
    mutationFn: (payload: FormData) =>
      studentRegistrationService.create(payload).then((res) => res.data),
    onSuccess: (created) => {
      toast.success("Student Registered Successfully");

      queryClient.setQueryData<any[]>(["student-registrations"], (old) => {
        if (!old) return [created];
        return [...old, created];
      });

      queryClient.invalidateQueries({ queryKey: ["student-registrations"] });
    },

    onError: (err: any) => {
      alert(err?.response?.data?.error || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      studentRegistrationService.update(id, payload).then((res) => res.data),

    onSuccess: (updated) => {
      toast.success("Student updated Successfully");

      queryClient.setQueryData<any[]>(["student-registrations"], (old) => {
        if (!old) return old;
        return old.map((item) => (item.id === updated.id ? updated : item));
      });

      queryClient.setQueryData(["student-registration", id], updated);

      // queryClient.invalidateQueries({ queryKey: ["student-registrations"] });

      Object.keys(updated).forEach((key) => {
        if (updated[key] !== undefined) {
          setValue(key as any, updated[key]);
        }
      });

      router.push("/student-registration-list");
    },
  });

  if (editLoading) {
    return <div>Loading...</div>;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      serviceCharge: Number(data.serviceCharge || 0),
    };

    if (mode === "edit" && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="relative">
      <Card className="p-8 rounded-2xl shadow-md bg-white overflow-visible">
        <h2 className="text-2xl font-semibold mb-6">Registration Form</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10">
          {/* ============================= PERSONAL INFORMATION ============================= */}
          <section>
            <h3 className="text-lg font-bold mb-4">Personal Information</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Student Name*</Label>
                <Input
                  placeholder="Student Name"
                  {...register("studentName")}
                />
                {errors.studentName && (
                  <p className="text-red-500 text-sm">
                    {errors.studentName.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Date of Birth*</Label>
                <Input
                  type="date"
                  max={todayStr}
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* MOBILE NUMBER */}
              <div>
                <Label>Mobile Number*</Label>
                <Controller
                  control={control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Mobile Number"
                      maxLength={10}
                      value={field.value || ""}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly);
                      }}
                    />
                  )}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Email*</Label>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* PARENT MOBILE */}
              <div>
                <Label>Parent Mobile</Label>
                <Controller
                  control={control}
                  name="parentMobile"
                  render={({ field }) => (
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Parent Mobile"
                      maxLength={10}
                      value={field.value || ""}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly);
                      }}
                    />
                  )}
                />
                {errors.parentMobile && (
                  <p className="text-red-500 text-sm">
                    {errors.parentMobile.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <Label>Father’s Name</Label>
                <Input
                  placeholder="Father’s Name"
                  {...register("fathersName")}
                />
                {errors.fathersName && (
                  <p className="text-red-500 text-sm">
                    {errors.fathersName.message}
                  </p>
                )}
              </div>

              {/* NATIONALITY */}
              <div>
                <Label>Nationality*</Label>
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Nationality" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.nationality && (
                  <p className="text-red-500 text-sm">
                    {errors.nationality.message}
                  </p>
                )}
              </div>

              {/* GENDER RADIO */}
              <div>
                <Label>Gender*</Label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Male" {...register("gender")} />{" "}
                    Male
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Female"
                      {...register("gender")}
                    />{" "}
                    Female
                  </label>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            {/* REGISTRATION DATE */}
            <div className="mt-6 grid md:grid-cols-3 gap-5">
              <div>
                <Label>Registration Date</Label>
                <Input
                  type="date"
                  max={todayStr}
                  {...register("registrationDate")}
                />
                {errors.registrationDate && (
                  <p className="text-red-500 text-sm">
                    {errors.registrationDate.message}
                  </p>
                )}
              </div>

              {mode === "edit" && (
                <div>
                  <Label>Status*</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white">
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="HOLD">Hold</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ============================= PRESENT ADDRESS ============================= */}
          <section>
            <h3 className="text-lg font-bold mb-4">Present Address</h3>

            <div className="grid gap-6">
              <div>
                <Label>Address Line 1*</Label>
                <Input {...register("addressLine1")} />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-sm">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Address Line 2</Label>
                <Input {...register("addressLine2")} />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* COUNTRY */}
                <div>
                  <Label>Country*</Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white">
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* STATE */}
                <div>
                  <Label>State*</Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white">
                          <SelectItem value="Andhra Pradesh">
                            Andhra Pradesh
                          </SelectItem>
                          <SelectItem value="Arunachal Pradesh">
                            Arunachal Pradesh
                          </SelectItem>
                          <SelectItem value="Assam">Assam</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Chhattisgarh">
                            Chhattisgarh
                          </SelectItem>
                          <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">
                            Dadra and Nagar Haveli and Daman and Diu
                          </SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Goa">Goa</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                          <SelectItem value="Himachal Pradesh">
                            Himachal Pradesh
                          </SelectItem>
                          <SelectItem value="Jammu and Kashmir">
                            Jammu and Kashmir
                          </SelectItem>
                          <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Kerala">Kerala</SelectItem>
                          <SelectItem value="Madhya Pradesh">
                            Madhya Pradesh
                          </SelectItem>
                          <SelectItem value="Maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="Manipur">Manipur</SelectItem>
                          <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                          <SelectItem value="Mizoram">Mizoram</SelectItem>
                          <SelectItem value="Nagaland">Nagaland</SelectItem>
                          <SelectItem value="Odisha">Odisha</SelectItem>
                          <SelectItem value="Puducherry">Puducherry</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                          <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="Sikkim">Sikkim</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="Telangana">Telangana</SelectItem>
                          <SelectItem value="Tripura">Tripura</SelectItem>
                          <SelectItem value="Uttar Pradesh">
                            Uttar Pradesh
                          </SelectItem>
                          <SelectItem value="Uttarakhand">
                            Uttarakhand
                          </SelectItem>
                          <SelectItem value="West Bengal">
                            West Bengal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>City*</Label>
                  <Input {...register("city")} />
                  {errors.city && (
                    <p className="text-red-500 text-sm">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* DISTRICT */}
                <div>
                  <Label>District*</Label>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={!stateValue}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>

                        <SelectContent className="z-50 bg-white">
                          {districts.length > 0 ? (
                            districts.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-400">
                              Select a state first
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.district && (
                    <p className="text-red-500 text-sm">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                {/* PINCODE */}
                <div>
                  <Label>Pincode*</Label>
                  <Controller
                    control={control}
                    name="pincode"
                    render={({ field }) => (
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Pincode"
                        maxLength={6}
                        value={field.value || ""}
                        onChange={(e) => {
                          const digitsOnly = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          field.onChange(digitsOnly);
                        }}
                      />
                    )}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ============================= COURSE DETAILS ============================= */}
          <section>
            <h3 className="text-lg font-bold mb-4">Courses</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* ABROAD MASTERS */}
              <div>
                <Label>Abroad Masters*</Label>
                <Controller
                  name="abroadMasters"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Masters" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="ABROADMASTERS-USA">
                          ABROADMASTERS-USA
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-UK">
                          ABROADMASTERS-UK
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-AUSTRALIA">
                          ABROADMASTERS-AUSTRALIA
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-CANADA">
                          ABROADMASTERS-CANADA
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-IRELAND">
                          ABROADMASTERS-IRELAND
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-FRANCE">
                          ABROADMASTERS-FRANCE
                        </SelectItem>
                        <SelectItem value="ABROADMASTERS-GERMANY">
                          ABROADMASTERS-GERMANY
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.abroadMasters && (
                  <p className="text-red-500 text-sm">
                    {errors.abroadMasters.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Course Name*</Label>
                <Input {...register("courseName")} />
                {errors.courseName && (
                  <p className="text-red-500 text-sm">
                    {errors.courseName.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Passport Number</Label>
                <Input {...register("passportNumber")} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* SERVICE CHARGE */}
              <div>
                <Label>Service Charge*</Label>
                <Controller
                  control={control}
                  name="serviceCharge"
                  render={({ field }) => (
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Service Charge"
                      value={
                        Number.isNaN(field.value) || field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        const asNumber =
                          digitsOnly === "" ? NaN : Number(digitsOnly);
                        field.onChange(asNumber);
                      }}
                    />
                  )}
                />
                {errors.serviceCharge && (
                  <p className="text-red-500 text-sm">
                    {errors.serviceCharge.message}
                  </p>
                )}
              </div>

              {/* ACADEMIC YEAR */}
              <div>
                <Label>Academic Year*</Label>
                <Controller
                  name="academicYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        {academicYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.academicYear && (
                  <p className="text-red-500 text-sm">
                    {errors.academicYear.message}
                  </p>
                )}
              </div>

              {/* OFFICE CITY */}
              <div>
                <Label>Office City*</Label>
                <Controller
                  name="officeCity"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Office" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="HYDERABAD_VS_HYD">
                          Hyderabad
                        </SelectItem>
                        <SelectItem value="VIJAYAWADA_VS_BZA">
                          Vijayawada
                        </SelectItem>
                        <SelectItem value="TIRUPATI_VS_TIR">
                          Tirupati
                        </SelectItem>
                        <SelectItem value="VIZAG_VS_VIZAG">Vizag</SelectItem>
                        <SelectItem value="MUMBAI_VS_MUM">Mumbai</SelectItem>
                        <SelectItem value="BANGALURU_VS_BAN">
                          Bengaluru
                        </SelectItem>
                        <SelectItem value="PUNE_VS_PUN">Pune</SelectItem>
                        <SelectItem value="ASSOCIATES_VS_MOU">
                          Associates
                        </SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="GEORGIA">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.officeCity && (
                  <p className="text-red-500 text-sm">
                    {errors.officeCity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* PROCESSED BY */}
              <div>
                <Label>Processed By*</Label>
                <Controller
                  name="processedBy"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Team" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="TEAM-1">TEAM-1</SelectItem>
                        <SelectItem value="TEAM-2">TEAM-2</SelectItem>
                        <SelectItem value="TEAM-ONLINE">TEAM-ONLINE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.processedBy && (
                  <p className="text-red-500 text-sm">
                    {errors.processedBy.message}
                  </p>
                )}
              </div>

              {/* COUNSELOR */}
              <div>
                <Label>Counselor Name*</Label>
                <Controller
                  name="counselorName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Counselor" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="R PUSHPALATHA">
                          R PUSHPALATHA
                        </SelectItem>
                        <SelectItem value="MORA NAVYA">MORA NAVYA</SelectItem>
                        <SelectItem value="GOTHULA SRINATH">
                          GOTHULA SRINATH
                        </SelectItem>
                        <SelectItem value="M KAVYA SREE-ONLINE">
                          M KAVYA SREE-ONLINE
                        </SelectItem>
                        <SelectItem value="MOHD ZAKIR-ONLINE">
                          MOHD ZAKIR-ONLINE
                        </SelectItem>
                        <SelectItem value="M SRINIVAS-ONLINE">
                          M SRINIVAS-ONLINE
                        </SelectItem>
                        <SelectItem value="CH V SHASHI KUMAR">
                          CH V SHASHI KUMAR
                        </SelectItem>
                        <SelectItem value="V KIRAN KUMAR">
                          V KIRAN KUMAR
                        </SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="SHAIK GAFOOR">
                          SHAIK GAFOOR
                        </SelectItem>
                        <SelectItem value="GUMPU SREENATH">
                          GUMPU SREENATH
                        </SelectItem>
                        <SelectItem value="BOYA SAI TEJA">
                          BOYA SAI TEJA
                        </SelectItem>
                        <SelectItem value="MUNJALA RAJASHEKHAR">
                          MUNJALA RAJASHEKHAR
                        </SelectItem>
                        <SelectItem value="K NARUN REDDY">
                          K NARUN REDDY
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.counselorName && (
                  <p className="text-red-500 text-sm">
                    {errors.counselorName.message}
                  </p>
                )}
              </div>

              {/* ASSIGNEE */}
              <div>
                <Label>Assignee Name*</Label>
                <Controller
                  name="assigneeName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        <SelectItem value="MUNJALA RAJASHEKAR">
                          MUNJALA RAJASHEKAR
                        </SelectItem>
                        <SelectItem value="SHAIK GAFOOR">
                          SHAIK GAFOOR
                        </SelectItem>
                        <SelectItem value="GUMPU SREENATH">
                          GUMPU SREENATH
                        </SelectItem>
                        <SelectItem value="JANGAPELLI RAJU">
                          JANGAPELLI RAJU
                        </SelectItem>
                        {/* <SelectItem value="SHABAD SRUTHI">SHABAD SRUTHI</SelectItem> */}
                        <SelectItem value="BANDA SPANDANA">
                          BANDA SPANDANA
                        </SelectItem>
                        <SelectItem value="V KIRAN KUMAR">
                          V KIRAN KUMAR
                        </SelectItem>
                        <SelectItem value="BOYA SAI TEJA">
                          BOYA SAI TEJA
                        </SelectItem>
                        <SelectItem value="R SANDHYA RANI">
                          R SANDHYA RANI
                        </SelectItem>
                        {/* <SelectItem value="KARTIK REDDY">KARTIK REDDY</SelectItem> */}
                        <SelectItem value="P SAI NIKHITHA">
                          P SAI NIKHITHA
                        </SelectItem>
                        {/* <SelectItem value="P NITHIN VARMA">
                      P NITHIN VARMA
                    </SelectItem> */}
                        <SelectItem value="K NARUN REDDY">
                          K NARUN REDDY
                        </SelectItem>
                        {/* <SelectItem value="A ANUSHA">A ANUSHA</SelectItem> */}
                        <SelectItem value="MORA NAVYA">MORA NAVYA</SelectItem>
                        <SelectItem value="CHV SHASHI KUMAR">
                          CHV SHASHI KUMAR
                        </SelectItem>
                        <SelectItem value="MAHESH PATIL">
                          MAHESH PATIL
                        </SelectItem>
                        {/* <SelectItem value="BHARATH MUDALAM">
                      BHARATH MUDALAM
                    </SelectItem> */}
                        <SelectItem value="R PUSHPALATHA">
                          R PUSHPALATHA
                        </SelectItem>
                        <SelectItem value="P RADHA KRISHNA">
                          P RADHA KRISHNA
                        </SelectItem>
                        {/* <SelectItem value="M SATWIK VARMA">
                      M SATWIK VARMA
                    </SelectItem> */}
                        {/* <SelectItem value="K RUCHITHA">K RUCHITHA</SelectItem> */}
                        <SelectItem value="B BHANU SAI PRAKASH">
                          B BHANU SAI PRAK
                        </SelectItem>
                        <SelectItem value="MUNEER">MUNEER</SelectItem>
                        <SelectItem value="Y VIJAY">Y VIJAY</SelectItem>
                        <SelectItem value="S PAVAN KRISHNA">
                          S PAVAN KRISHNA
                        </SelectItem>
                        <SelectItem value="A RAKESH">A RAKESH</SelectItem>
                        <SelectItem value="S NAGA VENKATESH">
                          S NAGA VENKATESH
                        </SelectItem>
                        <SelectItem value="M PAVAN KUMAR">
                          M PAVAN KUMAR
                        </SelectItem>
                        <SelectItem value="R SUBRAHMANYAM">
                          R SUBRAHMANYAM
                        </SelectItem>
                        <SelectItem value="A BHANU SAI RAM">
                          A BHANU SAI RAM
                        </SelectItem>
                        <SelectItem value="U VINAY">U VINAY</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.assigneeName && (
                  <p className="text-red-500 text-sm">
                    {errors.assigneeName.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
