import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentRuleForm } from "@/components/AssignmentRuleForm";
import { LeadTimeoutForm } from "@/components/LeadTimeoutForm";
import { saveAssignmentRuleAction, saveLeadTimeoutAction } from "@/lib/actions/settings";
import { getAssignmentRule, getLeadTimeout, listProperties } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [setting, timeout, needing] = await Promise.all([getAssignmentRule(), getLeadTimeout(), listProperties({ assigned: "false", isActive: "true" })]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="cols">
        <section className="panel">
          <div>
            <h2>Lead assignment</h2>
            <p className="muted mt-1">How a new lead picks its executive from the property&apos;s list.</p>
          </div>
          <AssignmentRuleForm action={saveAssignmentRuleAction} setting={setting} />
          {setting.updatedAt && (
            <p className="muted text-sm">
              Last changed{setting.updatedBy ? ` by ${setting.updatedBy.name}` : ""} on {formatDate(setting.updatedAt)}
            </p>
          )}
        </section>

        <div className="side">
          <section className="panel">
            <div>
              <h2>Lead response time</h2>
              <p className="muted mt-1">How long an executive has to move a lead out of Incoming before it goes to the next executive.</p>
            </div>
            <LeadTimeoutForm action={saveLeadTimeoutAction} setting={timeout} />
            {timeout.updatedAt && (
              <p className="muted text-sm">
                Last changed{timeout.updatedBy ? ` by ${timeout.updatedBy.name}` : ""} on {formatDate(timeout.updatedAt)}
              </p>
            )}
            <ul className="grid list-disc gap-2 pl-5 text-sm text-muted-foreground">
              <li>The clock starts when the lead is assigned and counts 24/7, with no working hours.</li>
              <li>It stops as soon as the status changes. Opening the lead doesn&apos;t stop it.</li>
              <li>If time runs out, the lead moves to the next eligible executive and their clock starts.</li>
              <li>If nobody else is eligible, the lead stays where it is.</li>
              <li>Assigning by hand restarts the clock.</li>
            </ul>
          </section>

          <section className="panel">
            <h2>How assignment works</h2>
            <ul className="grid list-disc gap-2 pl-5 text-sm text-muted-foreground">
              <li>Each property has its own list of executives, picked by you.</li>
              <li>Leads go to them one after another, by the order their accounts were created. Inactive executives are skipped.</li>
              <li>Each property keeps its own place in the rotation.</li>
              <li>If nobody can take a lead, it waits as Pending and is assigned when you pick executives for the property.</li>
              <li>Assigning a lead by hand doesn&apos;t change whose turn is next.</li>
            </ul>
          </section>

          <section className="panel">
            <h2>Properties needing executives</h2>
            {needing.length === 0 ? (
              <p className="muted">None. Every active property has executives.</p>
            ) : (
              <>
                <p className="muted text-sm">
                  {needing.length} {needing.length === 1 ? "property is" : "properties are"} holding leads as pending.
                </p>
                <Link className="btn btn-line" href="/admin/properties?assigned=false">
                  Assign executives
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
