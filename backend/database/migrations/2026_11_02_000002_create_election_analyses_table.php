<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('election_analyses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('election_type')->default('vidhan_sabha');
            $table->string('custom_election_name')->nullable();
            $table->string('election_name');
            $table->string('election_year', 10)->nullable();
            $table->string('state')->default('महाराष्ट्र');
            $table->string('district')->nullable();
            $table->string('taluka')->nullable();
            $table->string('city_or_village')->nullable();
            $table->string('constituency')->nullable();
            $table->unsignedBigInteger('total_registered_voters')->nullable()->default(0);
            $table->decimal('voting_percentage', 5, 2)->nullable()->default(0);
            $table->unsignedBigInteger('calculated_votes_polled')->nullable()->default(0);
            $table->string('previous_election_date')->nullable();
            $table->text('previous_results')->nullable();
            $table->text('additional_notes')->nullable();
            $table->text('assembly_segments')->nullable();
            $table->string('booth_count')->nullable();
            $table->string('zp_gat_name')->nullable();
            $table->string('ward_reservation')->nullable();
            $table->json('parties')->nullable();
            $table->json('other_candidates')->nullable();
            $table->text('political_equations')->nullable();
            $table->json('development_issues')->nullable();
            $table->text('ground_observations')->nullable();
            $table->json('swot_analysis')->nullable();
            $table->string('status')->default('completed');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });

        // Seed initial comprehensive analysis record
        DB::table('election_analyses')->insert([
            'uuid' => (string) Str::uuid(),
            'election_type' => 'vidhan_sabha',
            'custom_election_name' => null,
            'election_name' => 'महाराष्ट्र विधानसभा सार्वत्रिक निवडणूक २०२४',
            'election_year' => '2024',
            'state' => 'महाराष्ट्र',
            'district' => 'सांगली',
            'taluka' => 'मिरज',
            'city_or_village' => 'सांगली शहर व प्रभाग',
            'constituency' => '282 - सांगली विधानसभा मतदारसंघ',
            'total_registered_voters' => 348500,
            'voting_percentage' => 64.80,
            'calculated_votes_polled' => 225828,
            'previous_election_date' => '21 ऑक्टोबर 2019',
            'previous_results' => 'भाजप विजयी (सुधीर गाडगीळ - 93,659 मते, काँग्रेस पृथ्वीराज पाटील - 86,720 मते, मताधिक्य: 6,939)',
            'additional_notes' => 'शहरी व उपनगरीय मतदारांचा प्रभाव, अंतर्गत व्यापारी वर्ग व बहुजन मतांची विभागणी निर्णायक ठरते.',
            'assembly_segments' => 'सांगली शहर, विश्रामबाग, कुपवाड, माधवनगर, सांगलीवाडी',
            'booth_count' => '342',
            'zp_gat_name' => null,
            'ward_reservation' => 'खुला प्रवर्ग (General)',
            'parties' => json_encode([
                [
                    'id' => 'p1',
                    'name' => 'भारतीय जनता पक्ष (BJP)',
                    'candidate' => 'सुधीर गाडगीळ',
                    'alliance' => 'महायुती',
                    'previousVotes' => 93659,
                    'currentVotes' => 98200,
                    'voteShare' => 43.5,
                    'seatsWon' => 1,
                    'strengths' => 'मजबूत पक्ष संघटना, पारंपरिक व्यापारी व मध्यमवर्गीय मतपेढी, विकासकामांचा प्रचार',
                    'challenges' => 'स्थानिक बंडखोरीचा संभाव्य धोका, वाढती महागाई व पायाभूत सुविधांबाबत नाराजी'
                ],
                [
                    'id' => 'p2',
                    'name' => 'भारतीय राष्ट्रीय काँग्रेस (INC)',
                    'candidate' => 'पृथ्वीराज पाटील',
                    'alliance' => 'महाविकास आघाडी',
                    'previousVotes' => 86720,
                    'currentVotes' => 91400,
                    'voteShare' => 40.5,
                    'seatsWon' => 0,
                    'strengths' => 'जुना काँग्रेस पारंपरिक मतदार वर्ग, अल्पसंख्याक व मागासवर्गीय मते, सतत ग्राउंडवर संपर्क',
                    'challenges' => 'मित्रपक्षातील स्थानिक नेत्यांची छुपी बंडखोरी, निधी व प्रचाराची आक्रमकता कमी'
                ],
                [
                    'id' => 'p3',
                    'name' => 'अपक्ष (Independent)',
                    'candidate' => 'जयश्री पाटील / बंडखोर उमेदवार',
                    'alliance' => 'अपक्ष / अपक्ष आघाडी',
                    'previousVotes' => 12500,
                    'currentVotes' => 24800,
                    'voteShare' => 11.0,
                    'seatsWon' => 0,
                    'strengths' => 'स्थानिक सहकार क्षेत्रातील वैयक्तिक संपर्क, वसंतदादा घराण्याविषयी निष्ठावंत गट',
                    'challenges' => 'पक्ष चिन्हाचा अभाव, मर्यादित प्रचार यंत्रणा'
                ],
                [
                    'id' => 'p4',
                    'name' => 'वंचित बहुजन आघाडी (VBA)',
                    'candidate' => 'प्रा. विकास कांबळे',
                    'alliance' => 'स्वबळ',
                    'previousVotes' => 8200,
                    'currentVotes' => 9400,
                    'voteShare' => 4.2,
                    'seatsWon' => 0,
                    'strengths' => 'दलित व वंचित घटकांमध्ये वैचारिक निष्ठा, स्पष्ट स्थानिक अजेंडा',
                    'challenges' => 'कमी वित्तीय रसद, प्रमुख लढतीपासून मतदारांची परावृत्ती'
                ]
            ], JSON_UNESCAPED_UNICODE),
            'other_candidates' => json_encode([
                ['name' => 'सचिन पवार (बसपा)', 'votes' => '1850', 'remarks' => 'कौटुंबिक प्रभाव'],
                ['name' => 'नोटा (NOTA)', 'votes' => '2150', 'remarks' => 'नाराज मतदार']
            ], JSON_UNESCAPED_UNICODE),
            'political_equations' => 'मराठा, जैन, लिंगायत, मुस्लिम व दलित मतांचे संतुलित समीकरण. सांगली व्यापारी वर्गाची भूमिका निर्णायक.',
            'development_issues' => json_encode([
                ['issue' => 'सांगली-मिरज जोड रस्ता व उड्डाणपूल', 'priority' => 'High', 'impact' => 'शहरी वाहतुकीवर मोठा प्रभाव'],
                ['issue' => 'कृष्णा नदी पूर संरक्षण भिंत व सांडपाणी व्यवस्था', 'priority' => 'Critical', 'impact' => 'नदीकाठच्या १० प्रभागांचा प्रमुख प्रश्न'],
                ['issue' => 'कुपवाड एमआयडीसी पायाभूत सुविधा व रोजगार', 'priority' => 'Medium', 'impact' => 'तरुणांच्या रोजगारावर परिणाम']
            ], JSON_UNESCAPED_UNICODE),
            'ground_observations' => 'गेल्या निवडणुकीत केवळ ६,९३९ मतांचे अंतर असल्याने यंदा प्रत्येक वॉर्डातील २-३% मतविभागणी थेट निकाल ठरवू शकते.',
            'swot_analysis' => json_encode([
                'strengths' => ['कार्यकर्त्यांचे सक्रिय जाळे', 'विकासकामे व निधी वाटप'],
                'weaknesses' => ['अंतर्गत समन्वय अभाव', 'काही वॉर्डांमधील नाराजी'],
                'opportunities' => ['नवीन युवा मतदार संपर्क', 'सोशल मीडिया मोहीम'],
                'threats' => ['बंडखोर उमेदवारांची मतविभागणी']
            ], JSON_UNESCAPED_UNICODE),
            'status' => 'completed',
            'created_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_analyses');
    }
};
