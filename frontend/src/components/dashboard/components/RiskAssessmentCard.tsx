import { AlertTriangle, Shield, Info } from 'lucide-react';

interface RiskAssessment {
  cardiovascular: number;
  diabetes: number;
  hypertension: number;
  overall: number;
}

interface RiskAssessmentCardProps {
  riskAssessment: RiskAssessment;
}

export default function RiskAssessmentCard({ riskAssessment }: RiskAssessmentCardProps) {
  const getRiskLevel = (score: number) => {
    if (score < 20) return { level: 'Low', color: 'green' };
    if (score < 40) return { level: 'Moderate', color: 'yellow' };
    return { level: 'High', color: 'red' };
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return 'bg-green-500';
    if (score < 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const overallRisk = getRiskLevel(riskAssessment.overall);

  const riskFactors = [
    { name: 'Cardiovascular', score: riskAssessment.cardiovascular },
    { name: 'Diabetes', score: riskAssessment.diabetes },
    { name: 'Hypertension', score: riskAssessment.hypertension },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
            overallRisk.color === 'green' ? 'bg-green-100' :
            overallRisk.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {overallRisk.color === 'green' ? (
              <Shield className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className={`h-5 w-5 ${
                overallRisk.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <p className="text-sm text-gray-600">AI-powered health predictions</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Overall Risk Score */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Risk Level</span>
          <span className={`text-sm font-semibold ${
            overallRisk.color === 'green' ? 'text-green-600' :
            overallRisk.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {overallRisk.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getRiskColor(riskAssessment.overall)}`}
            style={{ width: `${riskAssessment.overall}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{riskAssessment.overall}% risk score</p>
      </div>

      {/* Individual Risk Factors */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Risk Factors</h4>
        {riskFactors.map((factor, index) => {
          const risk = getRiskLevel(factor.score);
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{factor.name}</span>
              <div className="flex items-center space-x-3">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getRiskColor(factor.score)}`}
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium w-16 text-right ${
                  risk.color === 'green' ? 'text-green-600' :
                  risk.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {risk.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}